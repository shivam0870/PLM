import { Entity } from '@loopback/repository';
export declare class Bom extends Entity {
    id: string;
    tenant_id: string;
    name: string;
    style_id: string;
    cost: number;
    data: object;
    created_at: string;
    updated_at: string;
    constructor(data?: Partial<Bom>);
}
export interface BomRelations {
}
export type BomWithRelations = Bom & BomRelations;
