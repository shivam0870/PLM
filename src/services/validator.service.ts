import {injectable, BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import Ajv2020, {KeywordCxt, ValidateFunction} from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import {TenantSchemaRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class ValidatorService {
  private ajv: Ajv2020;
  private validatorCache = new Map<string, ValidateFunction>();

  @repository(TenantSchemaRepository)
  public tenantSchemaRepository: TenantSchemaRepository;

  constructor() {
    this.ajv = new Ajv2020({
      allErrors: true,
      useDefaults: true,
      coerceTypes: 'array',
    });
    addFormats(this.ajv);

    // --- ADDING CUSTOM VALIDATION KEYWORDS ---

    this.ajv.addKeyword({
      keyword: 'hitValue',
      errors: true,
      validate: function (this: KeywordCxt, schema: any, data: number) {
        const valid = data >= 1 && data <= 12;
        if (!valid) {
          (this as any).errors = [{keyword: 'hitValue', message: 'hit value must be between 1 and 12'}];
        }
        return valid;
      }
    });

    this.ajv.addKeyword({
      keyword: 'nameValidation',
      errors: true,
      validate: function (this: KeywordCxt, schema: any, data: string) {
        const valid = data.length >= 3 && data.length <= 50;
        if (!valid) {
          (this as any).errors = [{keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.'}];
        }
        return valid;
      }
    });

    this.ajv.addKeyword({
      keyword: 'brandValidation',
      errors: true,
      validate: function (this: KeywordCxt, schema: any, data: string) {
        const validBrands = ['Nike', 'Adidas', 'Puma', 'Fynd'];
        const valid = validBrands.includes(data);
        if (!valid) {
          (this as any).errors = [{keyword: 'brandValidation', message: `Brand must be one of: ${validBrands.join(', ')}.`}];
        }
        return valid;
      }
    });

    this.ajv.addKeyword({
      keyword: 'seasonValue',
      errors: true,
      validate: function (this: KeywordCxt, schema: any, data: string) {
        const validSeasons = ['SS', 'FW', 'Spring', 'Summer', 'Fall', 'Winter'];
        const valid = validSeasons.includes(data);
        if (!valid) {
          (this as any).errors = [{keyword: 'seasonValue', message: `Season must be one of: ${validSeasons.join(', ')}.`}];
        }
        return valid;
      }
    });
  }
  getAjv(): Ajv2020 {
    return this.ajv;
  }
}
