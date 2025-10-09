import { Entity, EntityCrudRepository, Filter } from '@loopback/repository';
/**
 * This interface describes prototype members of the controller class
 * returned by `defineCrudRestController`.
 */
export interface CrudRestController<T extends Entity, IdType, IdName extends keyof T, Relations extends object = {}> {
    /**
     * The backing repository used to access & modify model data.
     */
    readonly repository: EntityCrudRepository<T, IdType>;
    /**
     * Implementation of the endpoint `GET /`.
     * @param filter Filter
     */
    find(filter?: Filter<T>): Promise<(T & Relations)[]>;
}
/**
 * Constructor of the controller class returned by `defineCrudRestController`.
 */
export interface CrudRestControllerCtor<T extends Entity, IdType, IdName extends keyof T, Relations extends object = {}> {
    new (repository: EntityCrudRepository<T, IdType, Relations>): CrudRestController<T, IdType, IdName, Relations>;
}
/**
 * Options to configure different aspects of a CRUD REST Controller.
 */
export interface CrudRestControllerOptions {
    /**
     * The base path where to "mount" the controller.
     */
    basePath: string;
    /**
     * Whether to generate readonly APIs
     */
    readonly?: boolean;
}
/**
 * Create (define) a CRUD Controller class for the given model.
 *
 * @example
 *
 * ```ts
 * const ProductController = defineCrudRestController<
 * Product,
 * typeof Product.prototype.id,
 * 'id'
 * >(Product, {basePath: '/products'});
 *
 * inject('repositories.ProductRepository')(
 *  ProductController,
 *   undefined,
 *   0,
 * );
 *
 * app.controller(ProductController);
 * ```
 *
 * @param modelCtor A model class, e.g. `Product`.
 * @param options Configuration options, e.g. `{basePath: '/products'}`.
 */
export declare function defineCrudRestController<T extends Entity, IdType, IdName extends keyof T, Relations extends object = {}>(modelCtor: typeof Entity & {
    prototype: T & {
        [key in IdName]: IdType;
    };
}, options: CrudRestControllerOptions): CrudRestControllerCtor<T, IdType, IdName, Relations>;
