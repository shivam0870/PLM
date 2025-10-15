import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false, postgresql: {schema: 'public', table: 'boms'}}})
export class Bom extends Entity {
  @property({
    type: 'string',
    id: true,
    postgresql: {
      columnName: 'id',
      dataType: 'text',
    },
  })
  id: string;

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
      columnName: 'name',
      dataType: 'text',
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'style_id',
      dataType: 'text',
    },
  })
  style_id: string;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'cost',
      dataType: 'numeric',
    },
  })
  cost: number;

  @property({
    type: 'object',
    required: true,
    postgresql: {
      columnName: 'data',
      dataType: 'jsonb',
    },
  })
  data: object;

  @property({
    type: 'date',
    required: false,
    generated: true,
    postgresql: {
      columnName: 'created_at',
    },
  })
  created_at: string;

  @property({
    type: 'date',
    required: false,
    generated: true,
    postgresql: {
      columnName: 'updated_at',
    },
  })
  updated_at: string;

  constructor(data?: Partial<Bom>) {
    super(data);
  }
}

export interface BomRelations {
  // describe navigational properties here
}

export type BomWithRelations = Bom & BomRelations;
