-- Bill of Materials (BOM) table
create table if not exists boms (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  style_id uuid not null references styles(id) on delete cascade,
  sku text not null, -- Stock Keeping Unit or material code
  name text not null,
  quantity numeric not null default 1,
  unit text not null, -- e.g., 'm', 'pcs', 'kg'
  data jsonb not null default '{}'::jsonb, -- For custom attributes on a BOM line
  created_at timestamptz not null default now()
);

create index if not exists idx_boms_tenant on boms(tenant_id);
create index if not exists idx_boms_style on boms(style_id);
