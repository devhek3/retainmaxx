create schema if not exists extensions;
create extension if not exists vector with schema extensions;

-- The prototype reels table has no owner column, so existing rows cannot be
-- assigned safely. Refuse to replace it unless the table is proven empty.
do $$
declare
  prototype_reel_count bigint;
begin
  if to_regclass('public.reels') is not null then
    execute 'select count(*) from public.reels' into prototype_reel_count;

    if prototype_reel_count > 0 then
      raise exception using
        errcode = 'P0001',
        message = format(
          'Refusing to replace public.reels: found %s ownerless row(s); provide an explicit auth-user ownership map first.',
          prototype_reel_count
        );
    end if;
  end if;
end
$$;

drop table if exists public.reels;
drop table if exists public.topics;

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  definition text not null,
  example_texts text[] not null,
  embedding extensions.vector(384) not null,
  display_order smallint not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topics_slug_not_blank check (btrim(slug) <> ''),
  constraint topics_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint topics_name_not_blank check (btrim(name) <> ''),
  constraint topics_definition_not_blank check (btrim(definition) <> ''),
  constraint topics_example_texts_count check (cardinality(example_texts) between 3 and 5),
  constraint topics_display_order_nonnegative check (display_order >= 0)
);

comment on table public.topics is
  'Controlled 45-topic catalogue used for selection, filtering, and exact topic classification.';
comment on column public.topics.embedding is
  'Normalized 384-dimensional Supabase/gte-small embedding of name, definition, and examples.';

create table public.user_topics (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete restrict,
  selected_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create index user_topics_topic_id_idx on public.user_topics (topic_id);

create table public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id uuid references public.topics (id) on delete restrict,
  source_platform text not null,
  source_external_id text not null,
  source_url text not null,
  title text,
  thumbnail_url text,
  transcript text,
  summary text,
  key_takeaways text[] not null default '{}'::text[],
  evidence jsonb not null default '[]'::jsonb,
  content_embedding extensions.vector(384),
  topic_similarity double precision,
  processing_status text not null default 'pending',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saves_user_source_key unique (user_id, source_platform, source_external_id),
  constraint saves_source_platform_allowed check (source_platform in ('instagram', 'tiktok', 'youtube')),
  constraint saves_source_external_id_not_blank check (btrim(source_external_id) <> ''),
  constraint saves_source_url_not_blank check (btrim(source_url) <> ''),
  constraint saves_source_url_https check (source_url ~ '^https://'),
  constraint saves_title_not_blank check (title is null or btrim(title) <> ''),
  constraint saves_thumbnail_url_not_blank check (thumbnail_url is null or btrim(thumbnail_url) <> ''),
  constraint saves_transcript_not_blank check (transcript is null or btrim(transcript) <> ''),
  constraint saves_summary_not_blank check (summary is null or btrim(summary) <> ''),
  constraint saves_key_takeaways_count check (cardinality(key_takeaways) <= 3),
  constraint saves_evidence_is_array check (jsonb_typeof(evidence) = 'array'),
  constraint saves_topic_similarity_range check (topic_similarity between -1 and 1),
  constraint saves_similarity_has_topic check (topic_similarity is null or topic_id is not null),
  constraint saves_processing_status_allowed check (processing_status in ('pending', 'processing', 'ready', 'failed')),
  constraint saves_ready_is_complete check (
    processing_status <> 'ready'
    or (
      title is not null
      and btrim(title) <> ''
      and transcript is not null
      and btrim(transcript) <> ''
      and summary is not null
      and btrim(summary) <> ''
      and cardinality(key_takeaways) between 1 and 3
      and topic_id is not null
      and topic_similarity is not null
      and content_embedding is not null
      and processed_at is not null
    )
  )
);

comment on table public.saves is
  'User-owned short-form captures and their pending/processing/ready/failed knowledge lifecycle.';
comment on column public.saves.topic_similarity is
  'Signed cosine similarity computed in match_selected_topic as 1 - cosine distance.';

create index saves_user_created_idx on public.saves (user_id, created_at desc);
create index saves_user_topic_created_ready_idx
  on public.saves (user_id, topic_id, created_at desc)
  where processing_status = 'ready';

alter table public.topics enable row level security;
alter table public.user_topics enable row level security;
alter table public.saves enable row level security;

revoke all on table public.topics, public.user_topics, public.saves from anon, authenticated, service_role;

grant select on table public.topics to anon, authenticated;
grant select, insert, delete on table public.user_topics to authenticated;
grant select, delete on table public.saves to authenticated;
grant select, insert, update, delete on table public.topics, public.user_topics, public.saves to service_role;

create policy topics_anon_select_active
  on public.topics
  for select
  to anon
  using (is_active);

create policy topics_authenticated_select_all
  on public.topics
  for select
  to authenticated
  using (true);

create policy user_topics_authenticated_select_own
  on public.user_topics
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy user_topics_authenticated_insert_own_active
  on public.user_topics
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.topics
      where topics.id = user_topics.topic_id
        and topics.is_active
    )
  );

create policy user_topics_authenticated_delete_own
  on public.user_topics
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy saves_authenticated_select_own
  on public.saves
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy saves_authenticated_delete_own
  on public.saves
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.match_selected_topic(
  p_user_id uuid,
  p_embedding extensions.vector(384)
)
returns table(topic_id uuid, similarity double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    topics.id,
    1 - (topics.embedding operator(extensions.<=>) p_embedding)
  from public.user_topics
  join public.topics on topics.id = user_topics.topic_id
  where user_topics.user_id = p_user_id
    and topics.is_active
  order by topics.embedding operator(extensions.<=>) p_embedding
  limit 1
$$;

revoke all on function public.match_selected_topic(uuid, extensions.vector)
  from public, anon, authenticated;
grant execute on function public.match_selected_topic(uuid, extensions.vector)
  to service_role;

comment on function public.match_selected_topic(uuid, extensions.vector) is
  'Server-only exact cosine matcher over one verified user''s active selected topics.';
