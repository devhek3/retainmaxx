begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select ok(
  (select relrowsecurity from pg_class where oid = 'public.topics'::regclass),
  'topics has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.user_topics'::regclass),
  'user_topics has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.saves'::regclass),
  'saves has RLS enabled'
);

select ok(has_table_privilege('anon', 'public.topics', 'select'), 'anon can select topics');
select ok(not has_table_privilege('anon', 'public.topics', 'insert'), 'anon cannot insert topics');
select ok(not has_table_privilege('anon', 'public.topics', 'update'), 'anon cannot update topics');
select ok(not has_table_privilege('anon', 'public.topics', 'delete'), 'anon cannot delete topics');
select ok(has_table_privilege('authenticated', 'public.topics', 'select'), 'authenticated can select topics');
select ok(not has_table_privilege('authenticated', 'public.topics', 'insert'), 'authenticated cannot insert topics');
select ok(not has_table_privilege('authenticated', 'public.topics', 'update'), 'authenticated cannot update topics');
select ok(not has_table_privilege('authenticated', 'public.topics', 'delete'), 'authenticated cannot delete topics');

select ok(not has_table_privilege('anon', 'public.user_topics', 'select'), 'anon cannot select user_topics');
select ok(not has_table_privilege('anon', 'public.user_topics', 'insert'), 'anon cannot insert user_topics');
select ok(not has_table_privilege('anon', 'public.user_topics', 'update'), 'anon cannot update user_topics');
select ok(not has_table_privilege('anon', 'public.user_topics', 'delete'), 'anon cannot delete user_topics');
select ok(has_table_privilege('authenticated', 'public.user_topics', 'select'), 'authenticated can select user_topics');
select ok(has_table_privilege('authenticated', 'public.user_topics', 'insert'), 'authenticated can insert user_topics');
select ok(not has_table_privilege('authenticated', 'public.user_topics', 'update'), 'authenticated cannot update user_topics');
select ok(has_table_privilege('authenticated', 'public.user_topics', 'delete'), 'authenticated can delete user_topics');

select ok(not has_table_privilege('anon', 'public.saves', 'select'), 'anon cannot select saves');
select ok(not has_table_privilege('anon', 'public.saves', 'insert'), 'anon cannot insert saves');
select ok(not has_table_privilege('anon', 'public.saves', 'update'), 'anon cannot update saves');
select ok(not has_table_privilege('anon', 'public.saves', 'delete'), 'anon cannot delete saves');
select ok(has_table_privilege('authenticated', 'public.saves', 'select'), 'authenticated can select saves');
select ok(not has_table_privilege('authenticated', 'public.saves', 'insert'), 'authenticated cannot insert saves');
select ok(not has_table_privilege('authenticated', 'public.saves', 'update'), 'authenticated cannot update saves');
select ok(has_table_privilege('authenticated', 'public.saves', 'delete'), 'authenticated can delete saves');

select ok(
  not exists (
    select 1
    from pg_proc
    cross join lateral aclexplode(coalesce(proacl, acldefault('f', proowner))) acl
    where pg_proc.oid = 'public.match_selected_topic(uuid, extensions.vector)'::regprocedure
      and acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
  ),
  'PUBLIC cannot execute matcher'
);
select ok(
  not has_function_privilege('anon', 'public.match_selected_topic(uuid, extensions.vector)', 'execute'),
  'anon cannot execute matcher'
);
select ok(
  not has_function_privilege('authenticated', 'public.match_selected_topic(uuid, extensions.vector)', 'execute'),
  'authenticated cannot execute matcher'
);
select ok(
  has_function_privilege('service_role', 'public.match_selected_topic(uuid, extensions.vector)', 'execute'),
  'service_role can execute matcher'
);
select is(
  (
    select prosecdef
    from pg_proc
    where oid = 'public.match_selected_topic(uuid, extensions.vector)'::regprocedure
  ),
  false,
  'matcher is SECURITY INVOKER'
);
select is(
  (
    select pg_get_function_identity_arguments(oid)
    from pg_proc
    where oid = 'public.match_selected_topic(uuid, extensions.vector)'::regprocedure
  ),
  'p_user_id uuid, p_embedding vector',
  'matcher identity arguments match its grants'
);

insert into auth.users (id, email, aud, role)
values
  ('10000000-0000-0000-0000-000000000001', 'a@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000002', 'b@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000003', 'cascade@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000004', 'no-selection@example.test', 'authenticated', 'authenticated');

insert into public.topics (slug, name, definition, example_texts, embedding, display_order)
values
  ('fitness', 'Fitness', 'Fitness test definition', array['Strength', 'Cardio', 'Mobility'], (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384), 0),
  ('nutrition', 'Nutrition', 'Nutrition test definition', array['Meals', 'Protein', 'Fiber'], (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384), 1),
  ('technology', 'Technology', 'Technology test definition', array['Devices', 'Software', 'Cloud'], (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384), 2),
  ('pets-animals', 'Pets & Animals', 'Animals test definition', array['Pets', 'Wildlife', 'Training'], (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384), 3)
on conflict (slug) do nothing;

update public.topics
set is_active = false
where slug = 'pets-animals';

set local role anon;
select is((select count(*) from public.topics where slug = 'pets-animals'), 0::bigint, 'anon sees active topics only');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is((select count(*) from public.topics where slug = 'pets-animals'), 1::bigint, 'authenticated sees inactive topics');
select lives_ok(
  $$insert into public.user_topics (user_id, topic_id)
    select '10000000-0000-0000-0000-000000000001', id from public.topics where slug = 'fitness'$$,
  'a user can select an active topic for itself'
);
select throws_ok(
  $$insert into public.user_topics (user_id, topic_id)
    select '10000000-0000-0000-0000-000000000001', id from public.topics where slug = 'pets-animals'$$,
  '42501',
  null,
  'a user cannot select an inactive topic'
);
select throws_ok(
  $$insert into public.user_topics (user_id, topic_id)
    select '10000000-0000-0000-0000-000000000002', id from public.topics where slug = 'nutrition'$$,
  '42501',
  null,
  'a user cannot insert another user topic selection'
);
reset role;

insert into public.user_topics (user_id, topic_id)
select '10000000-0000-0000-0000-000000000002', id from public.topics where slug = 'nutrition';
insert into public.user_topics (user_id, topic_id)
select '10000000-0000-0000-0000-000000000003', id from public.topics where slug = 'technology';

insert into public.saves (id, user_id, source_platform, source_external_id, source_url)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'instagram', 'a-save', 'https://www.instagram.com/reel/a-save/'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'youtube', 'b-save', 'https://www.youtube.com/shorts/b-save'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'tiktok', 'cascade-save', 'https://www.tiktok.com/@user/video/123');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is((select count(*) from public.user_topics), 1::bigint, 'user A sees only its topic selections');
select is((select count(*) from public.saves), 1::bigint, 'user A sees only its saves');
select lives_ok(
  $$delete from public.saves where id = '30000000-0000-0000-0000-000000000002'$$,
  'deleting another user save is a hidden no-op'
);
reset role;
select is(
  (select count(*) from public.saves where id = '30000000-0000-0000-0000-000000000002'),
  1::bigint,
  'user B save remains after user A delete attempt'
);

select throws_ok(
  $$insert into public.saves
      (user_id, source_platform, source_external_id, source_url, processing_status)
    values
      ('10000000-0000-0000-0000-000000000001', 'instagram', 'incomplete', 'https://www.instagram.com/reel/incomplete/', 'ready')$$,
  '23514',
  null,
  'ready saves must contain every required derived field'
);
select throws_ok(
  $$insert into public.saves
      (user_id, source_platform, source_external_id, source_url)
    values
      ('10000000-0000-0000-0000-000000000001', 'instagram', 'a-save', 'https://www.instagram.com/reel/a-save/')$$,
  '23505',
  null,
  'per-user source identity is idempotent'
);
select throws_ok(
  $$insert into public.saves
      (user_id, source_platform, source_external_id, source_url, content_embedding)
    values
      ('10000000-0000-0000-0000-000000000001', 'instagram', 'bad-vector', 'https://www.instagram.com/reel/bad-vector/', '[1,2,3]')$$,
  '22000',
  null,
  'save embeddings enforce 384 dimensions'
);
select throws_ok(
  $$delete from public.topics where slug = 'fitness'$$,
  '23503',
  null,
  'referenced topics cannot be deleted'
);

delete from auth.users where id = '10000000-0000-0000-0000-000000000003';
select is(
  (select count(*) from public.user_topics where user_id = '10000000-0000-0000-0000-000000000003'),
  0::bigint,
  'deleting an auth user cascades topic selections'
);
select is(
  (select count(*) from public.saves where user_id = '10000000-0000-0000-0000-000000000003'),
  0::bigint,
  'deleting an auth user cascades saves'
);
select is(
  (
    select count(*)
    from pg_indexes
    where schemaname = 'public'
      and indexdef ~* '\\m(hnsw|ivfflat)\\M'
  ),
  0::bigint,
  'no approximate vector index exists'
);

select * from finish();
rollback;
