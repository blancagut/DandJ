-- Run this FIRST in Supabase SQL Editor to enable the migration scripts
-- This creates a function that allows the Node scripts to execute raw SQL

create or replace function exec_sql(sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql;
end;
$$;
