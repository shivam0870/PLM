import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { TenantSchema, TenantSchemaRelations } from '../models';
export declare class TenantSchemaRepository extends DefaultCrudRepository<TenantSchema, typeof TenantSchema.prototype.version, TenantSchemaRelations> {
    constructor(dataSource: DbDataSource);
}
