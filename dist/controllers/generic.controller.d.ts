import { Application } from '@loopback/core';
import { Entity, DataObject } from '@loopback/repository';
import { ValidatorService } from '../services';
export declare class GenericController {
    private app;
    protected validatorService: ValidatorService;
    private getRepositoryName;
    private generateCustomId;
    constructor(app: Application, validatorService: ValidatorService);
    create(objectType: string, tenantId: string, data: DataObject<Entity>): Promise<Entity>;
    find(objectType: string, limit?: number, offset?: number): Promise<Entity[]>;
    findById(objectType: string, id: string): Promise<Entity>;
    updateById(objectType: string, id: string, tenantId: string, data: DataObject<Entity>): Promise<void>;
    deleteById(objectType: string, id: string): Promise<void>;
    aggregate(primaryObjectType: string, secondaryObjectType: string, limit: number | undefined, offset: number | undefined, relationField: string | undefined, tenantId: string): Promise<any[]>;
}
