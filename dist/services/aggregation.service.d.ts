import { Application } from '@loopback/core';
export declare class AggregationService {
    private app;
    constructor(app: Application);
    aggregate(primaryObjectType: string, secondaryObjectType: string, limit: number, offset: number, relationField: string, tenantId: string): Promise<any[]>;
    private getRepositoryName;
}
