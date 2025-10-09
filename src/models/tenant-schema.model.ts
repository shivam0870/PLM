import {Entity, model, property} from '@loopback/repository';

@model({settings: {postgresql: {schema: 'public', table: 'tenant_schemas'}}})
export class TenantSchema extends Entity {
  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'tenant_id',
      dataType: 'uuid',
    },
  })
  tenant_id: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'object_type',
      dataType: 'text',
    },
  })
  object_type: string;

  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
    postgresql: {
      columnName: 'version',
      dataType: 'integer',
    },
  })
  version: number;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'is_active',
      dataType: 'boolean',
    },
  })
  is_active: boolean;

  @property({
    type: 'object',
    required: true,
    postgresql: {
      columnName: 'schema',
      dataType: 'jsonb',
    },
  })
  schema: object;

  constructor(data?: Partial<TenantSchema>) {
    super(data);
  }
}

export interface TenantSchemaRelations {
  // describe navigational properties here
}

export type TenantSchemaWithRelations = TenantSchema & TenantSchemaRelations;
