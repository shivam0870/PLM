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
  private getRepositoryName(objectType: string): string {
    // Converts plural 'styles' to singular 'Style' and appends 'Repository'
    const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
    return singular.charAt(0).toUpperCase() + singular.slice(1) + 'Repository';
  }

  private async generateCustomId(objectType: string): Promise<string> {
    const repoName = this.getRepositoryName(objectType);
    const prefix = objectType.toUpperCase().slice(0, 3); // e.g., 'STY' for 'styles'
    try {
      const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
      const entities = await repo.find({ limit: 1, order: ['id DESC'] });
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
      // Check if ID exists, if yes, increment
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
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @inject('services.ValidatorService') protected validatorService: ValidatorService,
  ) {}
// JSON Rules library 
  @post('/api/{objectType}', {
    responses: {
      '200': {
        description: 'Generic model instance',
        content: {'application/json': {schema: {type: 'object'}}},
      },
    },
  })
  async create(
    @param.path.string('objectType') objectType: string,
    @param.header.string('x-tenant-id', {required: true}) tenantId: string,
    @requestBody() data: DataObject<Entity>,
  ): Promise<Entity> {
    (data as any).tenant_id = tenantId;

    // --- CUSTOM ID GENERATION ---
    const customId = await this.generateCustomId(objectType);
    (data as any).id = customId;
    if (objectType === 'styles') {
      (data as any).code = customId;
    }

    // --- EXPLICIT VALIDATION ---
    const schemaDef = await this.app.get<any>('repositories.TenantSchemaRepository').then(repo => repo.findOne({
      where: {tenant_id: tenantId, object_type: objectType.endsWith('s') ? objectType.slice(0, -1) : objectType, is_active: true},
    }));

    if (schemaDef && schemaDef.schema) {
      // For extensible models like BOM and Style, allow additional properties and remove required for generated fields
      const singularObjectType = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
      if (singularObjectType === 'bom') {
        (schemaDef.schema as any).additionalProperties = true;
        (schemaDef.schema as any).required = [];
      } else if (singularObjectType === 'style') {
        (schemaDef.schema as any).required = (schemaDef.schema as any).required || [];
        (schemaDef.schema as any).required = (schemaDef.schema as any).required.filter((r: string) => r !== 'code');
      }
      // Use rules engine for validation
      const facts = { objectType, data };
      const events = await this.validatorService.runRules(facts);
      if (events.length > 0) {
        console.error('Validation errors:', events);
        throw new HttpErrors.UnprocessableEntity(JSON.stringify(events));
      }
    }

    // Always perform fallback validation
    const errors: any[] = [];

    if ((data as any).name && (data as any).name.length < 3) {
      errors.push({keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.'});
    }

    if ((data as any).data && (data as any).data.hit && ((data as any).data.hit < 1 || (data as any).data.hit > 12)) {
      errors.push({keyword: 'hitValue', message: 'Hit value must be between 1 and 12.'});
    }

    if (errors.length > 0) {
      throw new HttpErrors.UnprocessableEntity(JSON.stringify(errors));
    }

    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    const model = (repo as any).model;
    if (model && model.definition && model.definition.properties && model.definition.properties.id) {
      const originalGenerated = model.definition.properties.id.generated;
      model.definition.properties.id.generated = false;
      try {
        return await repo.create(data);
      } finally {
        model.definition.properties.id.generated = originalGenerated;
      }
    } else {
      return await repo.create(data);
    }
  }

  @get('/api/{objectType}')
  async find(
    @param.path.string('objectType') objectType: string,
    @param.query.number('limit', {required: false}) limit: number = 10,
    @param.query.number('offset', {required: false}) offset: number = 0,
  ): Promise<Entity[]> {
    // Ensure positive values for limit and offset
    const safeLimit = Math.max(1, Math.min(limit, 100)); // Max 100 per page
    const safeOffset = Math.max(0, offset);

    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(
      `repositories.${repoName}`,
    );
    return repo.find({ limit: safeLimit, offset: safeOffset });
  }

  @get('/api/{objectType}/{id}')
  async findById(
    @param.path.string('objectType') objectType: string,
    @param.path.string('id') id: string,
  ): Promise<Entity> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(
      `repositories.${repoName}`,
    );
    return repo.findById(id);
  }

  @patch('/api/{objectType}/{id}')
  async updateById(
    @param.path.string('objectType') objectType: string,
    @param.path.string('id') id: string,
    @param.header.string('x-tenant-id', {required: true}) tenantId: string,
    @requestBody() data: DataObject<Entity>,
  ): Promise<void> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(
      `repositories.${repoName}`,
    );

    // --- EXPLICIT VALIDATION FOR PATCH ---
    const schemaDef = await this.app.get<any>('repositories.TenantSchemaRepository').then(repo => repo.findOne({
      where: {tenant_id: tenantId, object_type: objectType.endsWith('s') ? objectType.slice(0, -1) : objectType, is_active: true},
    }));

    if (schemaDef && schemaDef.schema) {
      // For extensible models like BOM and Style, allow additional properties and remove required for generated fields
      const singularObjectType = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
      if (singularObjectType === 'bom') {
        (schemaDef.schema as any).additionalProperties = true;
        (schemaDef.schema as any).required = [];
      } else if (singularObjectType === 'style') {
        (schemaDef.schema as any).required = (schemaDef.schema as any).required || [];
        (schemaDef.schema as any).required = (schemaDef.schema as any).required.filter((r: string) => r !== 'code');
      }
      // Use rules engine for validation
      const facts = { objectType, data };
      const events = await this.validatorService.runRules(facts);
      if (events.length > 0) {
        console.error('Validation errors:', events);
        throw new HttpErrors.UnprocessableEntity(JSON.stringify(events));
      }
    }

    // Always perform fallback validation for PATCH
    const errors: any[] = [];

    if ((data as any).name && (data as any).name.length < 3) {
      errors.push({keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.'});
    }

    if ((data as any).data && (data as any).data.brand && !['Nike', 'Adidas', 'Puma', 'Fynd'].includes((data as any).data.brand)) {
      errors.push({keyword: 'brandValidation', message: 'Brand must be one of: Nike, Adidas, Puma, Fynd.'});
    }

    if ((data as any).data && (data as any).data.hit && ((data as any).data.hit < 1 || (data as any).data.hit > 12)) {
      errors.push({keyword: 'hitValue', message: 'Hit value must be between 1 and 12.'});
    }
    if (errors.length > 0) {
      throw new HttpErrors.UnprocessableEntity(JSON.stringify(errors));
    }

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
    });

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
