import Ajv2020 from 'ajv/dist/2020';
import { TenantSchemaRepository } from '../repositories';
export declare class ValidatorService {
    private ajv;
    private validatorCache;
    tenantSchemaRepository: TenantSchemaRepository;
    constructor();
    getAjv(): Ajv2020;
}
