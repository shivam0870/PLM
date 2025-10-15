import { Entity } from '@loopback/repository';
export declare class BrandLookup extends Entity {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    constructor(data?: Partial<BrandLookup>);
}
export interface BrandLookupRelations {
}
export type BrandLookupWithRelations = BrandLookup & BrandLookupRelations;
