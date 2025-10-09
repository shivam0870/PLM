import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Style, StyleRelations} from '../models';

export class StyleRepository extends DefaultCrudRepository<
  Style,
  typeof Style.prototype.id,
  StyleRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Style, dataSource);
  }
}



//Connects models to database 
// TenantSchemaRepository - Loading schema from database