import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false, postgresql: {schema: 'public', table: 'styles'}}})
export class Style extends Entity {
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
    id: true,
    postgresql: {
      columnName: 'id',
      dataType: 'text',
    },
  })
  id: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'code',
      dataType: 'text',
    },
  })
  code: string;

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
      columnName: 'status',
      dataType: 'text',
    },
  })
  status: string;

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

  constructor(data?: Partial<Style>) {
    super(data);
  }
}

export interface StyleRelations {
  // describe navigational properties here
}

export type StyleWithRelations = Style & StyleRelations;