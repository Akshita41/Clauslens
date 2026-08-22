-- ClauseLens — initial schema
-- Four tables, pgvector, row-level security, and storage policies.
-- Safe to run more than once.

-- ────────────────────────────────────────────────────────────
-- Extensions
-- ────────────────────────────────────────────────────────────
create extension if not exists vector;

-- ────────────────────────────────────────────────────────────
-- Tables
-- ────────────────────────────────────────────────────────────

create table if not exists contracts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  filename       text not null,
  storage_path   text not null,
  title          text,
  counterparty   text,
  page_count     integer,
  clause_count   integer not null default 0,
  status         text not null default 'uploaded'
                 check (status in ('uploaded','parsing','extracting','analyzing','ready','failed')),
  -- true when no clause headings were found and the splitter fell back to
  -- paragraphs. Surfaced in the UI so the degradation is never silent.
  split_fallback boolean not null default false,
  error_message  text,
  created_at     timestamptz not null default now()
);

create table if not exists clauses (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts (id) on delete cascade,
  clause_no   text,
  heading     text,
  text        text not null,
  page        integer not null,
  char_start  integer,
  char_end    integer,
  -- Voyage embedding dimension. No ANN index: at ~1k clauses an exact scan
  -- is sub-millisecond, so HNSW would be complexity without a payoff.
  embedding   vector(1024),
  -- Keyword half of hybrid retrieval, maintained by Postgres itself.
  tsv         tsvector generated always as (
                to_tsvector('english', coalesce(heading, '') || ' ' || text)
              ) stored,
  created_at  timestamptz not null default now()
);

create table if not exists extractions (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts (id) on delete cascade,
  field_name  text not null,
  value       text,
  confidence  text check (confidence in ('high','medium','low')),
  -- The citation. Null only when the field genuinely is not in the contract.
  clause_id   uuid references clauses (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (contract_id, field_name)
);

create table if not exists risk_flags (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references contracts (id) on delete cascade,
  clause_id     uuid references clauses (id) on delete set null,
  severity      text not null check (severity in ('OK','CAUTION','HIGH_RISK')),
  reason        text not null,
  rule_id       text not null,
  confidence    text check (confidence in ('high','medium','low')),
  human_verdict text check (human_verdict in ('accepted','rejected')),
  created_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────
create index if not exists clauses_contract_id_idx     on clauses (contract_id);
create index if not exists clauses_tsv_idx             on clauses using gin (tsv);
create index if not exists contracts_user_id_idx       on contracts (user_id, created_at desc);
create index if not exists extractions_contract_id_idx on extractions (contract_id);
create index if not exists risk_flags_contract_id_idx  on risk_flags (contract_id);

-- ────────────────────────────────────────────────────────────
-- Row-level security
-- A user reaches their own contracts directly, and the three child tables
-- through the contract they belong to. Without these policies every table
-- is unreadable, which is the correct default.
-- ────────────────────────────────────────────────────────────

alter table contracts   enable row level security;
alter table clauses     enable row level security;
alter table extractions enable row level security;
alter table risk_flags  enable row level security;

drop policy if exists contracts_own on contracts;
create policy contracts_own on contracts
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists clauses_own on clauses;
create policy clauses_own on clauses
  for all to authenticated
  using (exists (
    select 1 from contracts c
    where c.id = clauses.contract_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from contracts c
    where c.id = clauses.contract_id and c.user_id = auth.uid()
  ));

drop policy if exists extractions_own on extractions;
create policy extractions_own on extractions
  for all to authenticated
  using (exists (
    select 1 from contracts c
    where c.id = extractions.contract_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from contracts c
    where c.id = extractions.contract_id and c.user_id = auth.uid()
  ));

drop policy if exists risk_flags_own on risk_flags;
create policy risk_flags_own on risk_flags
  for all to authenticated
  using (exists (
    select 1 from contracts c
    where c.id = risk_flags.contract_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from contracts c
    where c.id = risk_flags.contract_id and c.user_id = auth.uid()
  ));

-- ────────────────────────────────────────────────────────────
-- Grants
-- Explicit so this migration works on a project that does not have
-- "automatically expose new tables" switched on. RLS above is what
-- actually restricts the rows; these only open the door to the table.
-- ────────────────────────────────────────────────────────────
grant select, insert, update, delete
  on contracts, clauses, extractions, risk_flags
  to authenticated;

-- ────────────────────────────────────────────────────────────
-- Storage
-- Files are stored as  {user_id}/{contract_id}.pdf , so the first path
-- segment is the owner and the policies below compare against it.
-- ────────────────────────────────────────────────────────────

drop policy if exists contracts_storage_insert on storage.objects;
create policy contracts_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists contracts_storage_select on storage.objects;
create policy contracts_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists contracts_storage_delete on storage.objects;
create policy contracts_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
