import { Application } from '@loopback/core';
import { Entity, DataObject } from '@loopback/repository';
import { ValidatorService } from '../services';
import { TenantSchemaRepository } from '../repositories';
export declare class GenericController {
    private app;
    protected tenantSchemaRepository: TenantSchemaRepository;
    protected validatorService: ValidatorService;
    private getRepositoryName;
    constructor(app: Application, tenantSchemaRepository: TenantSchemaRepository, validatorService: ValidatorService);
    create(objectType: string, tenantId: string, data: DataObject<Entity>): Promise<Entity>;
    find(objectType: string): Promise<Entity[]>;
    findById(objectType: string, id: string): Promise<Entity>;
    updateById(objectType: string, id: string, tenantId: string, data: DataObject<Entity>): Promise<void>;
    deleteById(objectType: string, id: string): Promise<void>;
}
