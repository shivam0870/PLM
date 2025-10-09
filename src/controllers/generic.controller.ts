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
import {TenantSchemaRepository} from '../repositories';

export class GenericController {
  private getRepositoryName(objectType: string): string {
    // Converts plural 'styles' to singular 'Style' and appends 'Repository'
    const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
    return singular.charAt(0).toUpperCase() + singular.slice(1) + 'Repository';
  }
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @repository(TenantSchemaRepository) protected tenantSchemaRepository: TenantSchemaRepository,
    @inject('services.ValidatorService') protected validatorService: ValidatorService,
  ) {}

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

    // --- EXPLICIT VALIDATION ---
    const schemaDef = await this.tenantSchemaRepository.findOne({
      where: {tenant_id: tenantId, object_type: objectType.endsWith('s') ? objectType.slice(0, -1) : objectType, is_active: true},
    });

    if (schemaDef && schemaDef.schema) {
      const ajv = this.validatorService.getAjv();
      const validate = ajv.compile(schemaDef.schema);
      const valid = await validate(data);
      if (!valid) {
        console.error('Validation errors:', validate.errors);
        throw new HttpErrors.UnprocessableEntity(JSON.stringify(validate.errors));
      }
    }

    // Always perform fallback validation
    const errors: any[] = [];

    if ((data as any).name && (data as any).name.length < 3) {
      errors.push({keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.'});
    }

    if ((data as any).custom && (data as any).custom.brand && !['Nike', 'Adidas', 'Puma', 'Fynd'].includes((data as any).custom.brand)) {
      errors.push({keyword: 'brandValidation', message: 'Brand must be one of: Nike, Adidas, Puma, Fynd.'});
    }

    if ((data as any).custom && (data as any).custom.hit && ((data as any).custom.hit < 1 || (data as any).custom.hit > 12)) {
      errors.push({keyword: 'hitValue', message: 'Hit value must be between 1 and 12.'});
    }

    if (errors.length > 0) {
      throw new HttpErrors.UnprocessableEntity(JSON.stringify(errors));
    }

    // --- DYNAMIC REPOSITORY ---
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    return repo.create(data);
  }

  @get('/api/{objectType}')
  async find(
    @param.path.string('objectType') objectType: string,
  ): Promise<Entity[]> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(
      `repositories.${repoName}`,
    );
    return repo.find();
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
    const schemaDef = await this.tenantSchemaRepository.findOne({
      where: {
        tenant_id: tenantId,
        object_type: objectType.endsWith('s')
          ? objectType.slice(0, -1)
          : objectType,
        is_active: true,
      },
    });

    if (schemaDef && schemaDef.schema) {
      // For PATCH, we validate against the merged object
      const existingRecord = await repo.findById(id);
      const mergedData = {...existingRecord, ...data};

      const ajv = this.validatorService.getAjv();
      const validate = ajv.compile(schemaDef.schema);
      const valid = await validate(mergedData);
      if (!valid) {
        console.error('Validation errors:', validate.errors);
        throw new HttpErrors.UnprocessableEntity(
          JSON.stringify(validate.errors),
        );
      }
    }

    // Always perform fallback validation for PATCH
    const errors: any[] = [];

    if ((data as any).name && (data as any).name.length < 3) {
      errors.push({keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.'});
    }

    if ((data as any).custom && (data as any).custom.brand && !['Nike', 'Adidas', 'Puma', 'Fynd'].includes((data as any).custom.brand)) {
      errors.push({keyword: 'brandValidation', message: 'Brand must be one of: Nike, Adidas, Puma, Fynd.'});
    }

    if ((data as any).custom && (data as any).custom.hit && ((data as any).custom.hit < 1 || (data as any).custom.hit > 12)) {
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
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(
      `repositories.${repoName}`,
    );
    await repo.deleteById(id);
  }
}
