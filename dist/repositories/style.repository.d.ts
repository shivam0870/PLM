import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Style, StyleRelations } from '../models';
export declare class StyleRepository extends DefaultCrudRepository<Style, typeof Style.prototype.id, StyleRelations> {
    constructor(dataSource: DbDataSource);
}
