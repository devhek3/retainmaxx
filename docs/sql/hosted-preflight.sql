-- Read-only deployment preflight. Run against the intended hosted project and
-- attach the output before applying the corrective migration.
select current_database() as database_name,
       current_setting('server_version') as postgres_version;

select extname, extversion, extnamespace::regnamespace as extension_schema
from pg_extension
where extname = 'vector';

select to_regclass('public.topics') as topics,
       to_regclass('public.reels') as reels,
       to_regclass('public.user_topics') as user_topics,
       to_regclass('public.saves') as saves;

do $$
declare
  row_count bigint;
begin
  if to_regclass('public.topics') is null then
    raise notice 'public.topics: absent';
  else
    execute 'select count(*) from public.topics' into row_count;
    raise notice 'public.topics rows: %', row_count;
  end if;

  if to_regclass('public.reels') is null then
    raise notice 'public.reels: absent';
  else
    execute 'select count(*) from public.reels' into row_count;
    raise notice 'public.reels rows: %', row_count;
  end if;
end
$$;

select table_name, column_name, data_type, udt_schema, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('topics', 'reels', 'user_topics', 'saves')
order by table_name, ordinal_position;

select conrelid::regclass as relation,
       conname,
       contype,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid = any(array_remove(array[
    to_regclass('public.topics'),
    to_regclass('public.reels'),
    to_regclass('public.user_topics'),
    to_regclass('public.saves')
  ], null))
order by relation::text, conname;

select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('topics', 'reels', 'user_topics', 'saves')
order by tablename, indexname;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('topics', 'reels', 'user_topics', 'saves')
order by tablename, policyname;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('topics', 'reels', 'user_topics', 'saves')
  and grantee in ('anon', 'authenticated', 'service_role')
order by table_name, grantee, privilege_type;

select pg_describe_object(classid, objid, objsubid) as dependent_object,
       pg_describe_object(refclassid, refobjid, refobjsubid) as referenced_object,
       deptype
from pg_depend
where refobjid = any(array_remove(array[
  to_regclass('public.topics'),
  to_regclass('public.reels')
], null))
order by referenced_object, dependent_object;
