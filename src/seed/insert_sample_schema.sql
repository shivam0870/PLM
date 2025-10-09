-- Sample seed for one tenant and style schema
-- Set your tenant UUID here or let Postgres generate one in app; for demo we use a fixed UUID
\set tenant_id '11111111-1111-1111-1111-111111111111'

-- Upsert bom schema for tenant
with bom_payload as (
  select
    :'tenant_id'::uuid as tenant_id,
    'bom'::text as object_type,
    1 as version,
    true as is_active,
    jsonb_build_object(
      '$schema', 'https://json-schema.org/draft/2020-12/schema',
      'title', 'Bill of Material Item',
      'type', 'object',
      'additionalProperties', false,
      'properties', jsonb_build_object(
        'sku', jsonb_build_object('type', 'string', 'minLength', 1),
        'name', jsonb_build_object('type', 'string', 'minLength', 1),
        'quantity', jsonb_build_object('type', 'number', 'minimum', 0.001),
        'unit', jsonb_build_object('type', 'string', 'enum', jsonb_build_array('m', 'cm', 'pcs', 'kg', 'g')),
        'custom', jsonb_build_object('type', 'object') -- Allow any custom fields for now
      ),
      'required', jsonb_build_array('sku', 'name', 'quantity', 'unit')
    ) as schema
)
insert into tenant_schemas(tenant_id, object_type, version, is_active, schema)
select tenant_id, object_type, version, is_active, schema from bom_payload
on conflict (tenant_id, object_type, version)
  do update set is_active = excluded.is_active, schema = excluded.schema;

-- Upsert style schema for tenant
with payload as (
  select
    :'tenant_id'::uuid as tenant_id,
    'style'::text as object_type,
    1 as version,
    true as is_active,
    -- JSON Schema describing API payload: relational + custom
    jsonb_build_object(
      '$schema', 'https://json-schema.org/draft/2020-12/schema',
      'title', 'Style',
      'type', 'object',
      'additionalProperties', true, -- Be more flexible
      'properties', jsonb_build_object(
        'tenant_id', jsonb_build_object('type', 'string', 'format', 'uuid'),
        'code', jsonb_build_object('type','string', 'minLength',1),
        'name', jsonb_build_object('type','string', 'minLength',1),
        'status', jsonb_build_object('type','string', 'enum', jsonb_build_array('draft','active','archived'), 'default','draft'),
        'custom', jsonb_build_object(
          'type','object',
          'properties', jsonb_build_object(
            'season', jsonb_build_object('type','string', 'enum', jsonb_build_array('SS25','FW25')),
            'brand', jsonb_build_object('type','string')
            -- Other custom properties can be added here
          ),
          'required', jsonb_build_array('season','brand')
        )
      ),
      'required', jsonb_build_array('tenant_id', 'code','name','custom')
    ) as schema
)
insert into tenant_schemas(tenant_id, object_type, version, is_active, schema)
select tenant_id, object_type, version, is_active, schema from payload
on conflict (tenant_id, object_type, version)
  do update set is_active = excluded.is_active, schema = excluded.schema;
