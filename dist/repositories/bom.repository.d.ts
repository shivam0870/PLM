import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Bom, BomRelations } from '../models';
export declare class BomRepository extends DefaultCrudRepository<Bom, typeof Bom.prototype.id, BomRelations> {
    constructor(dataSource: DbDataSource);
}
