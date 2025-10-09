import { Entity } from '@loopback/repository';
export declare class TenantSchema extends Entity {
    tenant_id: string;
    object_type: string;
    version: number;
    is_active: boolean;
    schema: object;
    constructor(data?: Partial<TenantSchema>);
}
export interface TenantSchemaRelations {
}
export type TenantSchemaWithRelations = TenantSchema & TenantSchemaRelations;
