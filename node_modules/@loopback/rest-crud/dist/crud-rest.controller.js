"use strict";
// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineCrudRestController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const assert_1 = tslib_1.__importDefault(require("assert"));
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
function defineCrudRestController(modelCtor, options) {
    const modelName = modelCtor.name;
    const idPathParam = {
        name: 'id',
        in: 'path',
        schema: getIdSchema(modelCtor),
    };
    let ReadonlyRestControllerImpl = class ReadonlyRestControllerImpl {
        constructor(repository) {
            this.repository = repository;
        }
        async find(filter) {
            return this.repository.find(filter);
        }
        async findById(id, filter) {
            return this.repository.findById(id, filter);
        }
        async count(where) {
            return this.repository.count(where);
        }
    };
    tslib_1.__decorate([
        (0, rest_1.get)('/', {
            ...response.array(200, `Array of ${modelName} instances`, modelCtor, {
                includeRelations: true,
            }),
        }),
        tslib_1.__param(0, rest_1.param.filter(modelCtor)),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", Promise)
    ], ReadonlyRestControllerImpl.prototype, "find", null);
    tslib_1.__decorate([
        (0, rest_1.get)('/{id}', {
            ...response.model(200, `${modelName} instance`, modelCtor, {
                includeRelations: true,
            }),
        }),
        tslib_1.__param(0, (0, rest_1.param)(idPathParam)),
        tslib_1.__param(1, rest_1.param.query.object('filter', (0, rest_1.getFilterSchemaFor)(modelCtor, { exclude: 'where' }))),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object, Object]),
        tslib_1.__metadata("design:returntype", Promise)
    ], ReadonlyRestControllerImpl.prototype, "findById", null);
    tslib_1.__decorate([
        (0, rest_1.get)('/count', {
            ...response(200, `${modelName} count`, { schema: repository_1.CountSchema }),
        }),
        tslib_1.__param(0, rest_1.param.where(modelCtor)),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", Promise)
    ], ReadonlyRestControllerImpl.prototype, "count", null);
    ReadonlyRestControllerImpl = tslib_1.__decorate([
        (0, rest_1.api)({ basePath: options.basePath, paths: {} }),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], ReadonlyRestControllerImpl);
    let CrudRestControllerImpl = class CrudRestControllerImpl extends ReadonlyRestControllerImpl {
        constructor(repository) {
            super(repository);
            this.repository = repository;
        }
        async create(data) {
            return this.repository.create(
            // FIXME(bajtos) Improve repository API to support this use case
            // with no explicit type-casts required
            data);
        }
        async updateAll(data, where) {
            return this.repository.updateAll(
            // FIXME(bajtos) Improve repository API to support this use case
            // with no explicit type-casts required
            data, where);
        }
        async updateById(id, data) {
            await this.repository.updateById(id, 
            // FIXME(bajtos) Improve repository API to support this use case
            // with no explicit type-casts required
            data);
        }
        async replaceById(id, data) {
            await this.repository.replaceById(id, data);
        }
        async deleteById(id) {
            await this.repository.deleteById(id);
        }
    };
    tslib_1.__decorate([
        (0, rest_1.post)('/', {
            ...response.model(200, `${modelName} instance created`, modelCtor),
        }),
        tslib_1.__param(0, body(modelCtor, {
            title: `New${modelName}`,
            exclude: modelCtor.getIdProperties(),
        })),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", Promise)
    ], CrudRestControllerImpl.prototype, "create", null);
    tslib_1.__decorate([
        (0, rest_1.patch)('/', {
            ...response(200, `Count of ${modelName} models updated`, {
                schema: repository_1.CountSchema,
            }),
        }),
        tslib_1.__param(0, body(modelCtor, { partial: true })),
        tslib_1.__param(1, rest_1.param.where(modelCtor)),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object, Object]),
        tslib_1.__metadata("design:returntype", Promise)
    ], CrudRestControllerImpl.prototype, "updateAll", null);
    tslib_1.__decorate([
        (0, rest_1.patch)('/{id}', {
            responses: {
                '204': { description: `${modelName} was updated` },
            },
        }),
        tslib_1.__param(0, (0, rest_1.param)(idPathParam)),
        tslib_1.__param(1, body(modelCtor, { partial: true })),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object, Object]),
        tslib_1.__metadata("design:returntype", Promise)
    ], CrudRestControllerImpl.prototype, "updateById", null);
    tslib_1.__decorate([
        (0, rest_1.put)('/{id}', {
            responses: {
                '204': { description: `${modelName} was updated` },
            },
        }),
        tslib_1.__param(0, (0, rest_1.param)(idPathParam)),
        tslib_1.__param(1, body(modelCtor)),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object, Object]),
        tslib_1.__metadata("design:returntype", Promise)
    ], CrudRestControllerImpl.prototype, "replaceById", null);
    tslib_1.__decorate([
        (0, rest_1.del)('/{id}', {
            responses: {
                '204': { description: `${modelName} was deleted` },
            },
        }),
        tslib_1.__param(0, (0, rest_1.param)(idPathParam)),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", Promise)
    ], CrudRestControllerImpl.prototype, "deleteById", null);
    CrudRestControllerImpl = tslib_1.__decorate([
        (0, rest_1.api)({ basePath: options.basePath, paths: {} }),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], CrudRestControllerImpl);
    const controllerName = modelName + 'Controller';
    const defineNamedController = new Function('controllerClass', `return class ${controllerName} extends controllerClass {}`);
    const controller = defineNamedController(options.readonly ? ReadonlyRestControllerImpl : CrudRestControllerImpl);
    assert_1.default.equal(controller.name, controllerName);
    return controller;
}
exports.defineCrudRestController = defineCrudRestController;
function getIdSchema(modelCtor) {
    var _a;
    const idProp = modelCtor.getIdProperties()[0];
    const modelSchema = (0, rest_1.jsonToSchemaObject)((0, rest_1.getJsonSchema)(modelCtor));
    return (_a = modelSchema.properties) === null || _a === void 0 ? void 0 : _a[idProp];
}
// Temporary implementation of a short-hand version of `@requestBody`
// See https://github.com/loopbackio/loopback-next/issues/3493
function body(modelCtor, options) {
    return (0, rest_1.requestBody)({
        content: {
            'application/json': {
                schema: (0, rest_1.getModelSchemaRef)(modelCtor, options),
            },
        },
    });
}
// Temporary workaround for a missing `@response` decorator
// See https://github.com/loopbackio/loopback-next/issues/1672
// Please note this is just a workaround, the real helper should be implemented
// as a decorator that contributes OpenAPI metadata in a way that allows
// `@post` to merge the responses with the metadata provided at operation level
function response(statusCode, description, payload) {
    return {
        responses: {
            [`${statusCode}`]: {
                description,
                content: {
                    'application/json': payload,
                },
            },
        },
    };
}
(function (response) {
    function model(statusCode, description, modelCtor, options) {
        return response(statusCode, description, {
            schema: (0, rest_1.getModelSchemaRef)(modelCtor, options),
        });
    }
    response.model = model;
    function array(statusCode, description, modelCtor, options) {
        return response(statusCode, description, {
            schema: {
                type: 'array',
                items: (0, rest_1.getModelSchemaRef)(modelCtor, options),
            },
        });
    }
    response.array = array;
})(response || (response = {}));
//# sourceMappingURL=crud-rest.controller.js.map