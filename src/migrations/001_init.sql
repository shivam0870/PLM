-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Styles table: relational columns + JSONB for custom fields
create table if not exists styles (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  code text not null,
  name text not null,
  status text not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_styles_tenant on styles(tenant_id);
create index if not exists idx_styles_code_tenant on styles(tenant_id, code);
create index if not exists idx_styles_data_gin on styles using gin (data);
-- Example expression index for a hot custom field like season
-- create index if not exists idx_styles_season on styles((data->>'season'));

-- Tenant schemas
create table if not exists tenant_schemas (
  tenant_id uuid not null,
  object_type text not null,
  version int not null default 1,
  is_active boolean not null default false,
  schema jsonb not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, object_type, version)
);

-- Only one active per tenant/object_type
create unique index if not exists uq_active_schema on tenant_schemas(tenant_id, object_type)
  where is_active = true;
