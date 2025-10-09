import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TenantSchema, TenantSchemaRelations} from '../models';

export class TenantSchemaRepository extends DefaultCrudRepository<
  TenantSchema,
  typeof TenantSchema.prototype.version,
  TenantSchemaRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(TenantSchema, dataSource);
  }
}