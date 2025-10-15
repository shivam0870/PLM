import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Bom, BomRelations} from '../models';

export class BomRepository extends DefaultCrudRepository<
  Bom,
  typeof Bom.prototype.id,
  BomRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Bom, dataSource);
  }
}
