"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const services_1 = require("../services");
let GenericController = class GenericController {
    getRepositoryName(objectType) {
        // Converts plural 'styles' to singular 'Style' and appends 'Repository'
        const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
        return singular.charAt(0).toUpperCase() + singular.slice(1) + 'Repository';
    }
    async generateCustomId(objectType) {
        const repoName = this.getRepositoryName(objectType);
        const prefix = objectType.toUpperCase().slice(0, 3); // e.g., 'STY' for 'styles'
        try {
            const repo = await this.app.get(`repositories.${repoName}`);
            const entities = await repo.find({ limit: 1, order: ['id DESC'] });
            let nextNumber = 1;
            if (entities.length > 0) {
                const lastId = entities[0].id;
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
        }
        catch (error) {
            return `${prefix}-001`;
        }
    }
    constructor(app, validatorService) {
        this.app = app;
        this.validatorService = validatorService;
    }
    // JSON Rules library 
    async create(objectType, tenantId, data) {
        data.tenant_id = tenantId;
        // --- CUSTOM ID GENERATION ---
        const customId = await this.generateCustomId(objectType);
        data.id = customId;
        if (objectType === 'styles') {
            data.code = customId;
        }
        // --- EXPLICIT VALIDATION ---
        const schemaDef = await this.app.get('repositories.TenantSchemaRepository').then(repo => repo.findOne({
            where: { tenant_id: tenantId, object_type: objectType.endsWith('s') ? objectType.slice(0, -1) : objectType, is_active: true },
        }));
        if (schemaDef && schemaDef.schema) {
            // For extensible models like BOM and Style, allow additional properties and remove required for generated fields
            const singularObjectType = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
            if (singularObjectType === 'bom') {
                schemaDef.schema.additionalProperties = true;
                schemaDef.schema.required = [];
            }
            else if (singularObjectType === 'style') {
                schemaDef.schema.required = schemaDef.schema.required || [];
                schemaDef.schema.required = schemaDef.schema.required.filter((r) => r !== 'code');
            }
            // Use rules engine for validation
            const facts = { objectType, data };
            const events = await this.validatorService.runRules(facts);
            if (events.length > 0) {
                console.error('Validation errors:', events);
                throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(events));
            }
        }
        // Always perform fallback validation
        const errors = [];
        if (data.name && data.name.length < 3) {
            errors.push({ keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.' });
        }
        if (data.data && data.data.hit && (data.data.hit < 1 || data.data.hit > 12)) {
            errors.push({ keyword: 'hitValue', message: 'Hit value must be between 1 and 12.' });
        }
        if (errors.length > 0) {
            throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(errors));
        }
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        const model = repo.model;
        if (model && model.definition && model.definition.properties && model.definition.properties.id) {
            const originalGenerated = model.definition.properties.id.generated;
            model.definition.properties.id.generated = false;
            try {
                return await repo.create(data);
            }
            finally {
                model.definition.properties.id.generated = originalGenerated;
            }
        }
        else {
            return await repo.create(data);
        }
    }
    async find(objectType, limit = 10, offset = 0) {
        // Ensure positive values for limit and offset
        const safeLimit = Math.max(1, Math.min(limit, 100)); // Max 100 per page
        const safeOffset = Math.max(0, offset);
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        return repo.find({ limit: safeLimit, offset: safeOffset });
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
        const schemaDef = await this.app.get('repositories.TenantSchemaRepository').then(repo => repo.findOne({
            where: { tenant_id: tenantId, object_type: objectType.endsWith('s') ? objectType.slice(0, -1) : objectType, is_active: true },
        }));
        if (schemaDef && schemaDef.schema) {
            // For extensible models like BOM and Style, allow additional properties and remove required for generated fields
            const singularObjectType = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
            if (singularObjectType === 'bom') {
                schemaDef.schema.additionalProperties = true;
                schemaDef.schema.required = [];
            }
            else if (singularObjectType === 'style') {
                schemaDef.schema.required = schemaDef.schema.required || [];
                schemaDef.schema.required = schemaDef.schema.required.filter((r) => r !== 'code');
            }
            // Use rules engine for validation
            const facts = { objectType, data };
            const events = await this.validatorService.runRules(facts);
            if (events.length > 0) {
                console.error('Validation errors:', events);
                throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(events));
            }
        }
        // Always perform fallback validation for PATCH
        const errors = [];
        if (data.name && data.name.length < 3) {
            errors.push({ keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.' });
        }
        if (data.data && data.data.brand && !['Nike', 'Adidas', 'Puma', 'Fynd'].includes(data.data.brand)) {
            errors.push({ keyword: 'brandValidation', message: 'Brand must be one of: Nike, Adidas, Puma, Fynd.' });
        }
        if (data.data && data.data.hit && (data.data.hit < 1 || data.data.hit > 12)) {
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
    async aggregate(primaryObjectType, secondaryObjectType, limit = 10, offset = 0, relationField = 'style_id', tenantId) {
        const safeLimit = Math.max(1, Math.min(limit, 100));
        const safeOffset = Math.max(0, offset);
        const primaryRepoName = this.getRepositoryName(primaryObjectType);
        const secondaryRepoName = this.getRepositoryName(secondaryObjectType);
        const primaryRepo = await this.app.get(`repositories.${primaryRepoName}`);
        const secondaryRepo = await this.app.get(`repositories.${secondaryRepoName}`);
        const primaries = await primaryRepo.find({
            where: { tenant_id: tenantId },
            limit: safeLimit,
            offset: safeOffset,
        });
        const results = [];
        for (const primary of primaries) {
            const secondary = await secondaryRepo.find({
                where: { tenant_id: tenantId, [relationField]: primary.id },
            });
            results.push({
                ...primary,
                [secondaryObjectType]: secondary,
            });
        }
        return results;
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
    tslib_1.__param(1, rest_1.param.query.number('limit', { required: false })),
    tslib_1.__param(2, rest_1.param.query.number('offset', { required: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Number, Number]),
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
    tslib_1.__param(0, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__param(1, (0, core_1.inject)('services.ValidatorService')),
    tslib_1.__metadata("design:paramtypes", [core_1.Application,
        services_1.ValidatorService])
], GenericController);
//# sourceMappingURL=generic.controller.js.map