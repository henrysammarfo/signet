-- SIGNET initial schema

create extension if not exists "uuid-ossp";

create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('analyst', 'buyer')),
  address text not null unique,
  capabilities text[] default '{}',
  price_per_signal numeric default 0,
  accuracy_score numeric default 0,
  signals_count int default 0,
  revenue_usdc numeric default 0,
  xalgo_staked numeric default 0,
  xalgo_yield numeric default 0,
  status text default 'idle' check (status in ('active', 'idle', 'scanning')),
  created_at timestamptz default now()
);

create table if not exists signals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  content text not null,
  content_hash text,
  price_usdc numeric not null,
  embargo_until timestamptz,
  analyst_address text not null,
  analyst_name text,
  purchases int default 0,
  accuracy_score numeric default 0,
  direction text,
  confidence numeric,
  time_horizon text,
  alpha_arcade_market_id text,
  created_at timestamptz default now()
);

create table if not exists purchases (
  id uuid primary key default uuid_generate_v4(),
  signal_id uuid references signals(id) on delete cascade,
  buyer_address text not null,
  tx_id text,
  amount_usdc numeric not null,
  created_at timestamptz default now()
);

create table if not exists agent_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  message text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_signals_category on signals(category);
create index if not exists idx_signals_analyst on signals(analyst_address);
create index if not exists idx_agents_accuracy on agents(accuracy_score desc);
create index if not exists idx_agent_events_created on agent_events(created_at desc);

-- RLS: blocks anon/authenticated PostgREST; service_role bypasses policies
alter table agents enable row level security;
alter table signals enable row level security;
alter table purchases enable row level security;
alter table agent_events enable row level security;

-- Required so the app (service_role key) can read/write after RLS is enabled
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant all on all sequences in schema public to postgres, service_role;
grant select on all tables in schema public to anon, authenticated;
