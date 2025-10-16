import {inject} from '@loopback/core';
import {Entity, DataObject} from '@loopback/repository';
import {
  post,
  param,
  get,
  patch,
  del,
  requestBody,
} from '@loopback/rest';
import {AggregationService} from '../services/aggregation.service';
import {CrudService} from '../services/crud.service';
import {EntityService} from '../services/entity.service';

export class GenericController {
  constructor(
    @inject('services.AggregationService')
    protected aggregationService: AggregationService,
    @inject('services.CrudService') protected crudService: CrudService,
    @inject('services.EntityService') protected entityService: EntityService,
  ) {}

  @post('/api/{objectType}')
  async create(
    @param.path.string('objectType') objectType: string,
    @param.header.string('x-tenant-id', {required: true}) tenantId: string,
    @requestBody() data: DataObject<Entity>,
  ): Promise<Entity> {
    return this.entityService.create(objectType, tenantId, data);
  }

  @get('/api/{objectType}')
  async find(
    @param.path.string('objectType') objectType: string,
    @param.header.string('x-tenant-id', {required: true}) tenantId: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<Entity[]> {
    return this.crudService.find(objectType, tenantId, limit, offset);
  }

  @get('/api/{objectType}/{id}')
  async findById(
    @param.path.string('objectType') objectType: string,
    @param.path.string('id') id: string,
  ): Promise<Entity> {
    return this.crudService.findById(objectType, id);
  }

  @patch('/api/{objectType}/{id}')
  async updateById(
    @param.path.string('objectType') objectType: string,
    @param.path.string('id') id: string,
    @requestBody() data: DataObject<Entity>,
  ): Promise<void> {
    return this.crudService.updateById(objectType, id, data);
  }

  @del('/api/{objectType}/{id}')
  async deleteById(
    @param.path.string('objectType') objectType: string,
    @param.path.string('id') id: string,
  ): Promise<void> {
    return this.crudService.deleteById(objectType, id);
  }

  @get('/api/aggregate/{primaryObjectType}/{secondaryObjectType}')
  async aggregate(
    @param.path.string('primaryObjectType') primaryObjectType: string,
    @param.path.string('secondaryObjectType') secondaryObjectType: string,
    @param.query.number('limit', {required: false}) limit: number = 10,
    @param.query.number('offset', {required: false}) offset: number = 0,
    @param.query.string('relationField', {required: false}) relationField: string = 'style_id',
    @param.header.string('x-tenant-id', {required: true}) tenantId: string,
  ): Promise<any[]> {
    return this.aggregationService.aggregate(
      primaryObjectType,
      secondaryObjectType,
      limit,
      offset,
      relationField,
      tenantId,
    );
  }
}
