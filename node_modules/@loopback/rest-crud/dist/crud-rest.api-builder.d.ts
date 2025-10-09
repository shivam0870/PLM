import { ModelApiBuilder, ModelApiConfig } from '@loopback/model-api-builder';
import { ApplicationWithRepositories } from '@loopback/repository';
import { Model } from '@loopback/rest';
export interface ModelCrudRestApiConfig extends ModelApiConfig {
    basePath: string;
    /**
     * If true, the generated controller only has find and count APIs
     */
    readonly?: boolean;
}
export declare class CrudRestApiBuilder implements ModelApiBuilder {
    readonly pattern: string;
    build(application: ApplicationWithRepositories, modelClass: typeof Model & {
        prototype: Model;
    }, cfg: ModelApiConfig): Promise<void>;
}
