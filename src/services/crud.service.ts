import {Application, CoreBindings, inject} from '@loopback/core';
import {DefaultCrudRepository, Entity, DataObject} from '@loopback/repository';

export class CrudService {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}

  async find(
    objectType: string,
    tenantId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<Entity[]> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    return repo.find({
      where: {tenant_id: tenantId} as any,
      limit: Math.min(limit, 100),
      offset,
    });
  }

  async findById(objectType: string, id: string): Promise<Entity> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    return repo.findById(id);
  }

  async updateById(
    objectType: string,
    id: string,
    data: DataObject<Entity>,
  ): Promise<void> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    await repo.updateById(id, data);
  }

  async deleteById(objectType: string, id: string): Promise<void> {
    const repoName = this.getRepositoryName(objectType);
    const repo = await this.app.get<DefaultCrudRepository<Entity, any>>(`repositories.${repoName}`);
    await repo.deleteById(id);
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
