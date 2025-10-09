import { Entity } from '@loopback/repository';
export declare class Style extends Entity {
    tenant_id: string;
    id: string;
    code: string;
    name: string;
    status: string;
    custom: object;
    created_at: string;
    updated_at: string;
    constructor(data?: Partial<Style>);
}
export interface StyleRelations {
}
export type StyleWithRelations = Style & StyleRelations;
