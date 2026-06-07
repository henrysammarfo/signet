-- Run once if 001 was applied with RLS but without grants (permission denied for service_role)

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant all on all sequences in schema public to postgres, service_role;
grant select on all tables in schema public to anon, authenticated;
