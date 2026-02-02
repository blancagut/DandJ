-- Optional seed data (safe to run multiple times)

insert into leads (lead_type, first_name, last_name, email, phone, language, case_type, message, raw)
values (
  'contact',
  'Test',
  'Lead',
  'test@example.com',
  '(305) 555-0000',
  'en',
  'immigration',
  'This is a test lead inserted by db/seed.sql',
  jsonb_build_object('seed', true)
)
on conflict do nothing;
