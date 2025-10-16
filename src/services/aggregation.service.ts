import {Application, CoreBindings, inject} from '@loopback/core';
import {DefaultCrudRepository, Entity} from '@loopback/repository';

export class AggregationService {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}

  async aggregate(
    primaryObjectType: string,
    secondaryObjectType: string,
    limit: number,
    offset: number,
    relationField: string,
    tenantId: string,
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

  private getRepositoryName(objectType: string): string {
    const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
    const pascalCase = singular
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return pascalCase + 'Repository';
  }
}
