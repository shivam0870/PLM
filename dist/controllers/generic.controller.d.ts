import { Entity, DataObject } from '@loopback/repository';
import { AggregationService } from '../services/aggregation.service';
import { CrudService } from '../services/crud.service';
import { EntityService } from '../services/entity.service';
export declare class GenericController {
    protected aggregationService: AggregationService;
    protected crudService: CrudService;
    protected entityService: EntityService;
    constructor(aggregationService: AggregationService, crudService: CrudService, entityService: EntityService);
    create(objectType: string, tenantId: string, data: DataObject<Entity>): Promise<Entity>;
    find(objectType: string, tenantId: string, limit?: number, offset?: number): Promise<Entity[]>;
    findById(objectType: string, id: string): Promise<Entity>;
    updateById(objectType: string, id: string, data: DataObject<Entity>): Promise<void>;
    deleteById(objectType: string, id: string): Promise<void>;
    aggregate(primaryObjectType: string, secondaryObjectType: string, limit: number | undefined, offset: number | undefined, relationField: string | undefined, tenantId: string): Promise<any[]>;
}
