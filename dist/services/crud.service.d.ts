import { Application } from '@loopback/core';
import { Entity, DataObject } from '@loopback/repository';
export declare class CrudService {
    private app;
    constructor(app: Application);
    find(objectType: string, tenantId: string, limit?: number, offset?: number): Promise<Entity[]>;
    findById(objectType: string, id: string): Promise<Entity>;
    updateById(objectType: string, id: string, data: DataObject<Entity>): Promise<void>;
    deleteById(objectType: string, id: string): Promise<void>;
    private getRepositoryName;
}
