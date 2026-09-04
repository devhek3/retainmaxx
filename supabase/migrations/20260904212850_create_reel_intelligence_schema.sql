-- The MVP embeds a controlled topic profile (name, definition, and examples)
-- and each reel transcript. Vector dimensionality is intentionally unconstrained:
-- the proposal does not choose an embedding provider or model, so locking a
-- provider-specific dimension here would be premature.
create extension if not exists vector with schema extensions;

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  definition text not null,
  example_texts text[] not null,
  embedding extensions.vector,
  created_at timestamptz not null default now(),
  constraint topics_name_not_blank check (btrim(name) <> ''),
  constraint topics_definition_not_blank check (btrim(definition) <> ''),
  constraint topics_example_texts_count check (cardinality(example_texts) between 3 and 5)
);

comment on table public.topics is
  'Controlled Reel Intelligence taxonomy. Its profile is name, definition, and 3-5 representative examples.';
comment on column public.topics.embedding is
  'Embedding of the topic profile, precomputed when the controlled taxonomy changes.';

create table public.reels (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  transcript text not null,
  embedding extensions.vector,
  topic_id uuid not null references public.topics (id) on delete restrict,
  topic_score real not null,
  rich_summary text not null,
  key_takeaways text[] not null,
  evidence jsonb not null,
  created_at timestamptz not null default now(),
  constraint reels_source_url_not_blank check (btrim(source_url) <> ''),
  constraint reels_transcript_not_blank check (btrim(transcript) <> ''),
  constraint reels_topic_score_range check (topic_score between 0 and 1),
  constraint reels_rich_summary_not_blank check (btrim(rich_summary) <> ''),
  constraint reels_key_takeaways_count check (cardinality(key_takeaways) between 1 and 3),
  constraint reels_evidence_is_nonempty_array check (
    jsonb_typeof(evidence) = 'array' and jsonb_array_length(evidence) > 0
  )
);

comment on table public.reels is
  'Captured short-form sources with their transcript, selected topic, and grounded structured insight.';
comment on column public.reels.topic_score is
  'The final selected-topic score returned by the bounded structured extraction.';
comment on column public.reels.evidence is
  'Timestamp evidence from the transcript, stored as [{"at": "MM:SS", "for": "claim"}].';

create index reels_topic_id_idx on public.reels (topic_id);
create index reels_created_at_idx on public.reels (created_at desc);

-- Exact cosine search across the small controlled taxonomy needs no HNSW or IVFFlat index.
alter table public.topics enable row level security;
alter table public.reels enable row level security;
