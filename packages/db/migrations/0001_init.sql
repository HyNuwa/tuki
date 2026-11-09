-- Modelo de datos mínimo (doc 02 §10) + ajustes de la investigación.
-- PostgreSQL ≥ 15. Montos en centavos de ARS (bigint), nunca float.
--
-- Reglas de integridad:
--   * unique(claim_id) en reservas: una claim nunca se acredita dos veces.
--   * unique(idempotency_key) en reclamos y órdenes de pago.
--   * Sin borrado físico de movimientos financieros (trigger al final).
--   * PII (CVU) separada en buyer_vault; el resto usa buyer_key (HMAC).

create extension if not exists pgcrypto;

create table brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  cuit        text not null unique,
  created_at  timestamptz not null default now()
);

create table merchants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  cuit        text not null unique,
  phone       text not null,
  address     text not null,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Facturas del distribuidor al comercio: techo de reclamos por SKU.
create table sell_in_invoices (
  invoice_ref text primary key,
  merchant_id uuid not null references merchants(id),
  sku_code    text not null,
  units       integer not null check (units > 0),
  recorded_at timestamptz not null default now()
);
create index on sell_in_invoices (merchant_id, sku_code);

create type campaign_status as enum ('draft', 'active', 'paused', 'closed');

create table campaigns (
  id                 uuid primary key default gen_random_uuid(),
  brand_id           uuid not null references brands(id),
  name               text not null,
  status             campaign_status not null default 'draft',
  starts_at          timestamptz not null,
  ends_at            timestamptz not null check (ends_at > starts_at),
  budget             bigint not null check (budget > 0),
  pricing            jsonb not null,           -- PricingPolicy (packages/domain/src/pricing.ts)
  limits             jsonb not null,           -- CampaignLimits
  funding_confirmed  boolean not null default false,
  terms_url          text,
  escrow_address     text,                     -- opcional: CampaignEscrow en Celo
  created_at         timestamptz not null default now(),
  constraint active_requires_funding check (status <> 'active' or funding_confirmed)
);

create table campaign_skus (
  campaign_id uuid not null references campaigns(id),
  sku_code    text not null,
  name        text not null,
  price       bigint not null check (price > 0),
  primary key (campaign_id, sku_code)
);

create table campaign_merchants (
  campaign_id uuid not null references campaigns(id),
  merchant_id uuid not null references merchants(id),
  primary key (campaign_id, merchant_id)
);

create table merchant_codes (
  code        text primary key,
  campaign_id uuid not null references campaigns(id),
  merchant_id uuid not null references merchants(id),
  used_at     timestamptz,
  issued_at   timestamptz not null default now()
);

-- PII: acceso restringido; cifrar a nivel columna o con KMS en producción.
create table buyer_vault (
  buyer_key   text primary key,               -- HMAC-SHA256(CVU, sal)
  cvu         text not null,
  consent_version text not null,
  consented_at timestamptz not null
);

create type claim_status as enum (
  'draft', 'submitted', 'under_review', 'approved', 'rejected',
  'payout_pending', 'paid', 'payout_failed', 'disputed', 'reversed', 'adjusted'
);

create table purchase_claims (
  id              uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  campaign_id     uuid not null references campaigns(id),
  merchant_id     uuid not null references merchants(id),
  sku_code        text not null,
  buyer_key       text not null references buyer_vault(buyer_key),
  status          claim_status not null,
  evidence_level  text not null check (evidence_level in ('A', 'B', 'C', 'insufficient')),
  reasons         text[] not null default '{}',
  payout_blocked  boolean not null default false,
  purchased_at    timestamptz not null,
  claimed_at      timestamptz not null default now(),
  foreign key (campaign_id, sku_code) references campaign_skus(campaign_id, sku_code),
  foreign key (campaign_id, merchant_id) references campaign_merchants(campaign_id, merchant_id)
);
create index on purchase_claims (campaign_id, buyer_key);
create index on purchase_claims (campaign_id, merchant_id, sku_code);

create table evidence (
  id               uuid primary key default gen_random_uuid(),
  claim_id         uuid not null references purchase_claims(id),
  type             text not null,              -- merchant_code | payment_proof | receipt_photo
  storage_key      text,                       -- object storage privado, nunca público
  fingerprint      text unique,                -- tickets reutilizados
  extracted_fields jsonb not null default '{}'
);

create type ledger_entry_type as enum ('reserve', 'release', 'settle', 'reverse');

create table reward_ledger (
  seq         bigserial primary key,
  campaign_id uuid not null references campaigns(id),
  claim_id    uuid not null references purchase_claims(id),
  entry_type  ledger_entry_type not null,
  amount      bigint not null check (amount >= 0),
  created_at  timestamptz not null default now(),
  unique (claim_id, entry_type)                -- una reserva y un settle por reclamo
);

create table payouts (
  id              uuid primary key default gen_random_uuid(),
  claim_id        uuid not null unique references purchase_claims(id),
  idempotency_key text not null unique,
  amount          bigint not null check (amount > 0),
  currency        text not null default 'ARS',
  status          text not null check (status in ('pending', 'paid', 'failed')),
  provider_ref    text unique,
  created_at      timestamptz not null default now()
);

create table audit_events (
  id          bigserial primary key,
  claim_id    uuid references purchase_claims(id),
  actor       jsonb not null,
  action      text not null,
  old_state   text,
  new_state   text,
  reason      text not null,
  created_at  timestamptz not null default now()
);

create table support_cases (
  id          uuid primary key default gen_random_uuid(),
  claim_id    uuid references purchase_claims(id),
  opened_by   text not null,
  case_reason text not null,
  resolution  text,
  opened_at   timestamptz not null default now(),
  closed_at   timestamptz
);

-- Movimientos financieros y auditoría: solo inserción.
create function forbid_mutation() returns trigger language plpgsql as $$
begin
  raise exception '% es de solo inserción', tg_table_name;
end $$;

create trigger reward_ledger_append_only before update or delete on reward_ledger
  for each row execute function forbid_mutation();
create trigger audit_events_append_only before update or delete on audit_events
  for each row execute function forbid_mutation();
