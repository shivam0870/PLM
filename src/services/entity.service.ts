import {Application, CoreBindings, inject} from '@loopback/core';
import {DefaultCrudRepository, Entity, DataObject} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {ValidatorService} from './validator.service';

export class EntityService {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @inject('services.ValidatorService') protected validatorService: ValidatorService,
  ) {}

  async create(
    objectType: string,
    tenantId: string,
    data: DataObject<Entity>,
  ): Promise<Entity> {
    // Special case for brand-lookups
    if (objectType === 'brand-lookups') {
      const repo = await this.app.get<DefaultCrudRepository<Entity, any>>('repositories.BrandLookupRepository');
      return repo.create(data);
    }

    // Generic logic for other objects
    (data as any).tenant_id = tenantId;
    const customId = await this.generateCustomId(objectType);
    (data as any).id = customId;
    if (objectType === 'styles') {
      (data as any).code = customId;
    }

    // --- ONLY JSON Rules Engine Validation ---
    const facts = {
      objectType,
      tenantId,
      name: (data as any).name,
      data: (data as any).data || {},
    };
    const ruleErrors = await this.validatorService.runRules(facts);
    
    if (ruleErrors.length > 0) {
      throw new HttpErrors.UnprocessableEntity(JSON.stringify(ruleErrors));
    }

    // --- Custom Business Logic ---
    if (objectType === 'styles') {
      const styleData = (data as any).data || {};
      if (styleData.brand === 'Nike' && !styleData.season) {
        styleData.season = 'SS25';
      }
      if (styleData.brand === 'Adidas' && !styleData.season) {
        styleData.season = 'FW25';
      }
      (data as any).data = styleData;
    }

    if (objectType === 'boms') {
      if ((data as any).cost > 1000 && !(data as any).data?.priority) {
        (data as any).data = (data as any).data || {};
        (data as any).data.priority = 'high';
      }
    }

    (data as any).updated_at = new Date().toISOString();

    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    return repo.create(data);
  }

  private async generateCustomId(objectType: string): Promise<string> {
    const repoName = this.getRepositoryName(objectType);
    const prefix = objectType.toUpperCase().slice(0, 3);
    try {
      const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
      const entities = await repo.find({limit: 1, order: ['id DESC']});
      let nextNumber = 1;
      if (entities.length > 0) {
        const lastId = (entities[0] as any).id as string;
        if (lastId && lastId.startsWith(prefix + '-')) {
          const lastNumber = parseInt(lastId.split('-')[1], 10);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
      }
      let customId = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
      let exists = await repo.findById(customId).catch(() => null);
      while (exists) {
        nextNumber++;
        customId = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
        exists = await repo.findById(customId).catch(() => null);
      }
      return customId;
    } catch (error) {
      return `${prefix}-001`;
    }
  }

  private getRepositoryName(objectType: string): string {
    const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
    const pascalCase = singular
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return pascalCase + 'Repository';
  }
}
