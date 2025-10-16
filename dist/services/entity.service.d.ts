import { Application } from '@loopback/core';
import { Entity, DataObject } from '@loopback/repository';
import { ValidatorService } from './validator.service';
export declare class EntityService {
    private app;
    protected validatorService: ValidatorService;
    constructor(app: Application, validatorService: ValidatorService);
    create(objectType: string, tenantId: string, data: DataObject<Entity>): Promise<Entity>;
    private generateCustomId;
    private getRepositoryName;
}
