import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false, postgresql: {schema: 'public', table: 'brand_lookups'}}})
export class BrandLookup extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataType: 'uuid',
      defaultFn: 'uuid_generate_v4()',
    },
  })
  id: string;

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
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'is_active',
      dataType: 'boolean',
    },
  })
  is_active: boolean;

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

  constructor(data?: Partial<BrandLookup>) {
    super(data);
  }
}

export interface BrandLookupRelations {
  // describe navigational properties here
}

export type BrandLookupWithRelations = BrandLookup & BrandLookupRelations;
