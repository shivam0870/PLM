"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const aggregation_service_1 = require("../services/aggregation.service");
const crud_service_1 = require("../services/crud.service");
const entity_service_1 = require("../services/entity.service");
let GenericController = class GenericController {
    constructor(aggregationService, crudService, entityService) {
        this.aggregationService = aggregationService;
        this.crudService = crudService;
        this.entityService = entityService;
    }
    async create(objectType, tenantId, data) {
        return this.entityService.create(objectType, tenantId, data);
    }
    async find(objectType, tenantId, limit = 10, offset = 0) {
        return this.crudService.find(objectType, tenantId, limit, offset);
    }
    async findById(objectType, id) {
        return this.crudService.findById(objectType, id);
    }
    async updateById(objectType, id, data) {
        return this.crudService.updateById(objectType, id, data);
    }
    async deleteById(objectType, id) {
        return this.crudService.deleteById(objectType, id);
    }
    async aggregate(primaryObjectType, secondaryObjectType, limit = 10, offset = 0, relationField = 'style_id', tenantId) {
        return this.aggregationService.aggregate(primaryObjectType, secondaryObjectType, limit, offset, relationField, tenantId);
    }
};
exports.GenericController = GenericController;
tslib_1.__decorate([
    (0, rest_1.post)('/api/{objectType}'),
    tslib_1.__param(0, rest_1.param.path.string('objectType')),
    tslib_1.__param(1, rest_1.param.header.string('x-tenant-id', { required: true })),
    tslib_1.__param(2, (0, rest_1.requestBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], GenericController.prototype, "create", null);
tslib_1.__decorate([
    (0, rest_1.get)('/api/{objectType}'),
    tslib_1.__param(0, rest_1.param.path.string('objectType')),
    tslib_1.__param(1, rest_1.param.header.string('x-tenant-id', { required: true })),
    tslib_1.__param(2, rest_1.param.query.number('limit')),
    tslib_1.__param(3, rest_1.param.query.number('offset')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Number, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], GenericController.prototype, "find", null);
tslib_1.__decorate([
    (0, rest_1.get)('/api/{objectType}/{id}'),
    tslib_1.__param(0, rest_1.param.path.string('objectType')),
    tslib_1.__param(1, rest_1.param.path.string('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], GenericController.prototype, "findById", null);
tslib_1.__decorate([
    (0, rest_1.patch)('/api/{objectType}/{id}'),
    tslib_1.__param(0, rest_1.param.path.string('objectType')),
    tslib_1.__param(1, rest_1.param.path.string('id')),
    tslib_1.__param(2, (0, rest_1.requestBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], GenericController.prototype, "updateById", null);
tslib_1.__decorate([
    (0, rest_1.del)('/api/{objectType}/{id}'),
    tslib_1.__param(0, rest_1.param.path.string('objectType')),
    tslib_1.__param(1, rest_1.param.path.string('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], GenericController.prototype, "deleteById", null);
tslib_1.__decorate([
    (0, rest_1.get)('/api/aggregate/{primaryObjectType}/{secondaryObjectType}'),
    tslib_1.__param(0, rest_1.param.path.string('primaryObjectType')),
    tslib_1.__param(1, rest_1.param.path.string('secondaryObjectType')),
    tslib_1.__param(2, rest_1.param.query.number('limit', { required: false })),
    tslib_1.__param(3, rest_1.param.query.number('offset', { required: false })),
    tslib_1.__param(4, rest_1.param.query.string('relationField', { required: false })),
    tslib_1.__param(5, rest_1.param.header.string('x-tenant-id', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Number, Number, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], GenericController.prototype, "aggregate", null);
exports.GenericController = GenericController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)('services.AggregationService')),
    tslib_1.__param(1, (0, core_1.inject)('services.CrudService')),
    tslib_1.__param(2, (0, core_1.inject)('services.EntityService')),
    tslib_1.__metadata("design:paramtypes", [aggregation_service_1.AggregationService,
        crud_service_1.CrudService,
        entity_service_1.EntityService])
], GenericController);
//# sourceMappingURL=generic.controller.js.map