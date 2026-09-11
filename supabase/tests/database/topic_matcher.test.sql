begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users (id, email, aud, role)
values
  ('11000000-0000-0000-0000-000000000001', 'matcher-a@example.test', 'authenticated', 'authenticated'),
  ('11000000-0000-0000-0000-000000000002', 'matcher-b@example.test', 'authenticated', 'authenticated'),
  ('11000000-0000-0000-0000-000000000003', 'matcher-empty@example.test', 'authenticated', 'authenticated');

insert into public.topics (slug, name, definition, example_texts, embedding, display_order)
values
  ('fitness', 'Fitness', 'Fitness test definition', array['Strength', 'Cardio', 'Mobility'], (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384), 0),
  ('nutrition', 'Nutrition', 'Nutrition test definition', array['Meals', 'Protein', 'Fiber'], (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384), 1),
  ('technology', 'Technology', 'Technology test definition', array['Devices', 'Software', 'Cloud'], (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384), 2)
on conflict (slug) do nothing;

update public.topics
set embedding = (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384)
where slug = 'fitness';

update public.topics
set embedding = (array[-1::real] || array_fill(0::real, array[383]))::extensions.vector(384)
where slug = 'nutrition';

update public.topics
set embedding = (array[0.6::real, 0.8::real] || array_fill(0::real, array[382]))::extensions.vector(384)
where slug = 'technology';

insert into public.user_topics (user_id, topic_id)
select '11000000-0000-0000-0000-000000000001', id
from public.topics
where slug in ('fitness', 'nutrition');

insert into public.user_topics (user_id, topic_id)
select '11000000-0000-0000-0000-000000000002', id
from public.topics
where slug = 'technology';

set local role service_role;
select is(
  (
    select topics.slug
    from public.match_selected_topic(
      '11000000-0000-0000-0000-000000000001',
      (array[0.6::real, 0.8::real] || array_fill(0::real, array[382]))::extensions.vector(384)
    ) match
    join public.topics on topics.id = match.topic_id
  ),
  'fitness',
  'matcher considers only user A selected topics, not user B perfect match'
);
select is(
  round((
    select similarity::numeric
    from public.match_selected_topic(
      '11000000-0000-0000-0000-000000000001',
      (array[0.6::real, 0.8::real] || array_fill(0::real, array[382]))::extensions.vector(384)
    )
  ), 6),
  0.600000::numeric,
  'matcher returns 1 - cosine distance as signed similarity'
);
select is(
  round((
    select similarity::numeric
    from public.match_selected_topic(
      '11000000-0000-0000-0000-000000000002',
      (array[0.6::real, 0.8::real] || array_fill(0::real, array[382]))::extensions.vector(384)
    )
  ), 6),
  1.000000::numeric,
  'a perfect selected-topic match has similarity one'
);
select is(
  (
    select count(*)
    from public.match_selected_topic(
      '11000000-0000-0000-0000-000000000003',
      (array[1::real] || array_fill(0::real, array[383]))::extensions.vector(384)
    )
  ),
  0::bigint,
  'matcher returns zero rows when the user has no selected topic'
);
reset role;

select * from finish();
rollback;
