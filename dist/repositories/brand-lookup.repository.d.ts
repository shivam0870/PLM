import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { BrandLookup, BrandLookupRelations } from '../models';
export declare class BrandLookupRepository extends DefaultCrudRepository<BrandLookup, typeof BrandLookup.prototype.id, BrandLookupRelations> {
    constructor(dataSource: DbDataSource);
}
