"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const services_1 = require("../services");
const repositories_1 = require("../repositories");
let GenericController = class GenericController {
    getRepositoryName(objectType) {
        // Converts plural 'styles' to singular 'Style' and appends 'Repository'
        const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
        return singular.charAt(0).toUpperCase() + singular.slice(1) + 'Repository';
    }
    constructor(app, tenantSchemaRepository, validatorService) {
        this.app = app;
        this.tenantSchemaRepository = tenantSchemaRepository;
        this.validatorService = validatorService;
    }
    async create(objectType, tenantId, data) {
        data.tenant_id = tenantId;
        // --- EXPLICIT VALIDATION ---
        const schemaDef = await this.tenantSchemaRepository.findOne({
            where: { tenant_id: tenantId, object_type: objectType.endsWith('s') ? objectType.slice(0, -1) : objectType, is_active: true },
        });
        if (schemaDef && schemaDef.schema) {
            const ajv = this.validatorService.getAjv();
            const validate = ajv.compile(schemaDef.schema);
            const valid = await validate(data);
            if (!valid) {
                console.error('Validation errors:', validate.errors);
                throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(validate.errors));
            }
        }
        // Always perform fallback validation
        const errors = [];
        if (data.name && data.name.length < 3) {
            errors.push({ keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.' });
        }
        if (data.custom && data.custom.brand && !['Nike', 'Adidas', 'Puma', 'Fynd'].includes(data.custom.brand)) {
            errors.push({ keyword: 'brandValidation', message: 'Brand must be one of: Nike, Adidas, Puma, Fynd.' });
        }
        if (data.custom && data.custom.hit && (data.custom.hit < 1 || data.custom.hit > 12)) {
            errors.push({ keyword: 'hitValue', message: 'Hit value must be between 1 and 12.' });
        }
        if (errors.length > 0) {
            throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(errors));
        }
        // --- DYNAMIC REPOSITORY ---
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        return repo.create(data);
    }
    async find(objectType) {
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        return repo.find();
    }
    async findById(objectType, id) {
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        return repo.findById(id);
    }
    async updateById(objectType, id, tenantId, data) {
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
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
            const mergedData = { ...existingRecord, ...data };
            const ajv = this.validatorService.getAjv();
            const validate = ajv.compile(schemaDef.schema);
            const valid = await validate(mergedData);
            if (!valid) {
                console.error('Validation errors:', validate.errors);
                throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(validate.errors));
            }
        }
        // Always perform fallback validation for PATCH
        const errors = [];
        if (data.name && data.name.length < 3) {
            errors.push({ keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.' });
        }
        if (data.custom && data.custom.brand && !['Nike', 'Adidas', 'Puma', 'Fynd'].includes(data.custom.brand)) {
            errors.push({ keyword: 'brandValidation', message: 'Brand must be one of: Nike, Adidas, Puma, Fynd.' });
        }
        if (data.custom && data.custom.hit && (data.custom.hit < 1 || data.custom.hit > 12)) {
            errors.push({ keyword: 'hitValue', message: 'Hit value must be between 1 and 12.' });
        }
        if (errors.length > 0) {
            throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(errors));
        }
        await repo.updateById(id, data);
    }
    async deleteById(objectType, id) {
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        await repo.deleteById(id);
    }
};
exports.GenericController = GenericController;
tslib_1.__decorate([
    (0, rest_1.post)('/api/{objectType}', {
        responses: {
            '200': {
                description: 'Generic model instance',
                content: { 'application/json': { schema: { type: 'object' } } },
            },
        },
    }),
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
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
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
    tslib_1.__param(2, rest_1.param.header.string('x-tenant-id', { required: true })),
    tslib_1.__param(3, (0, rest_1.requestBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, Object]),
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
exports.GenericController = GenericController = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__param(1, (0, repository_1.repository)(repositories_1.TenantSchemaRepository)),
    tslib_1.__param(2, (0, core_1.inject)('services.ValidatorService')),
    tslib_1.__metadata("design:paramtypes", [core_1.Application,
        repositories_1.TenantSchemaRepository,
        services_1.ValidatorService])
], GenericController);
//# sourceMappingURL=generic.controller.js.map