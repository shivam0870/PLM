import {Application, CoreBindings, inject} from '@loopback/core';
import {
  repository,
  Entity,
  DataObject,
  DefaultCrudRepository,
  Filter,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  patch,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {ValidatorService} from '../services';
export class GenericController {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @inject('services.ValidatorService') protected validatorService: ValidatorService,
  ) {}

  private getRepositoryName(objectType: string): string {
    const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
    const pascalCase = singular
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return pascalCase + 'Repository';
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

  @post('/api/{objectType}')
  async create(
    @param.path.string('objectType') objectType: string,
    @param.header.string('x-tenant-id', {required: true}) tenantId: string,
    @requestBody() data: DataObject<Entity>,
  ): Promise<Entity> {
    if (objectType === 'brand-lookups') {
      const repo = await this.app.get<DefaultCrudRepository<Entity, any>>('repositories.BrandLookupRepository');
      return repo.create(data);
    }

    (data as any).tenant_id = tenantId;
    const customId = await this.generateCustomId(objectType);
    (data as any).id = customId;
    if (objectType === 'styles') {
      (data as any).code = customId;
    }

    const schemaDef = await this.app.get<any>('repositories.TenantSchemaRepository').then(repo => repo.findOne({
      where: {tenant_id: tenantId, object_type: objectType.endsWith('s') ? objectType.slice(0, -1) : objectType, is_active: true},
    }));

    if (schemaDef && schemaDef.schema) {
      const singularObjectType = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
      if (singularObjectType === 'bom') {
        (schemaDef.schema as any).additionalProperties = true;
        (schemaDef.schema as any).required = [];
      } else if (singularObjectType === 'style') {
        (schemaDef.schema as any).required = (schemaDef.schema as any).required || [];
        (schemaDef.schema as any).required = (schemaDef.schema as any).required.filter((r: string) => r !== 'code');
      }
      const facts = {objectType, data};
      const events = await this.validatorService.runRules(facts);
      if (events.length > 0) {
        throw new HttpErrors.UnprocessableEntity(JSON.stringify(events));
      }
    }

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

    const errors: any[] = [];
    if ((data as any).name && (data as any).name.length < 3) {
      errors.push({keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.'});
    }

    if (objectType === 'styles' && (data as any).data?.brand) {
      const brandLookupRepo = await this.app.get<DefaultCrudRepository<Entity, any>>('repositories.BrandLookupRepository');
      const allowedBrands = await brandLookupRepo.find({where: {tenant_id: tenantId, is_active: true} as any});
      if (allowedBrands.length > 0) {
        const brandNames = allowedBrands.map(b => (b as any).name);
        if (!brandNames.includes((data as any).data.brand)) {
          errors.push({keyword: 'brandValidation', message: `Brand must be one of: ${brandNames.join(', ')}.`});
        }
      }
    }
    if ((data as any).data && (data as any).data.hit && ((data as any).data.hit < 1 || (data as any).data.hit > 12)) {
      errors.push({keyword: 'hitValue', message: 'Hit value must be between 1 and 12.'});
    }
    if (errors.length > 0) {
      throw new HttpErrors.UnprocessableEntity(JSON.stringify(errors));
    }

    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    return repo.create(data);
  }

  @get('/api/{objectType}')
  async find(
    @param.path.string('objectType') objectType: string,
    @param.header.string('x-tenant-id', {required: true}) tenantId: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<Entity[]> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    return repo.find({
      where: {tenant_id: tenantId} as any,
      limit: Math.min(limit, 100),
      offset,
    });
  }

  @get('/api/{objectType}/{id}')
  async findById(
    @param.path.string('objectType') objectType: string,
    @param.path.string('id') id: string,
  ): Promise<Entity> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    return repo.findById(id);
  }

  @patch('/api/{objectType}/{id}')
  async updateById(
    @param.path.string('objectType') objectType: string,
    @param.path.string('id') id: string,
    @requestBody() data: DataObject<Entity>,
  ): Promise<void> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    await repo.updateById(id, data);
  }

  @del('/api/{objectType}/{id}')
  async deleteById(
    @param.path.string('objectType') objectType: string,
    @param.path.string('id') id: string,
  ): Promise<void> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    await repo.deleteById(id);
  }

  @get('/api/aggregate/{primaryObjectType}/{secondaryObjectType}')
  async aggregate(
    @param.path.string('primaryObjectType') primaryObjectType: string,
    @param.path.string('secondaryObjectType') secondaryObjectType: string,
    @param.query.number('limit', {required: false}) limit: number = 10,
    @param.query.number('offset', {required: false}) offset: number = 0,
    @param.query.string('relationField', {required: false}) relationField: string = 'style_id',
    @param.header.string('x-tenant-id', {required: true}) tenantId: string,
  ): Promise<any[]> {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const primaryRepoName = this.getRepositoryName(primaryObjectType);
    const secondaryRepoName = this.getRepositoryName(secondaryObjectType);

    const primaryRepo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${primaryRepoName}`);
    const secondaryRepo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${secondaryRepoName}`);

    const primaries = await primaryRepo.find({
      where: {tenant_id: tenantId} as any,
      limit: safeLimit,
      offset: safeOffset,
    }); // can we make this as a seperate service because we done wanna expose this

    const results = [];
    for (const primary of primaries) {
      const secondary = await secondaryRepo.find({
        where: {tenant_id: tenantId, [relationField]: (primary as any).id} as any,
      });
      results.push({
        ...primary,
        [secondaryObjectType]: secondary,
      });
    }

    return results;
  }
}
