import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {BrandLookup, BrandLookupRelations} from '../models';

export class BrandLookupRepository extends DefaultCrudRepository<
  BrandLookup,
  typeof BrandLookup.prototype.id,
  BrandLookupRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(BrandLookup, dataSource);
  }
}
