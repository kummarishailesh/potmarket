create table if not exists public.potmarket_state (
  id bigint primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.potmarket_state enable row level security;

revoke all on table public.potmarket_state from anon, authenticated;
grant all on table public.potmarket_state to service_role;
