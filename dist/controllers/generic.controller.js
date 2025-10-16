"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const services_1 = require("../services");
let GenericController = class GenericController {
    constructor(app, validatorService) {
        this.app = app;
        this.validatorService = validatorService;
    }
    getRepositoryName(objectType) {
        const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
        const pascalCase = singular
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        return pascalCase + 'Repository';
    }
    async generateCustomId(objectType) {
        const repoName = this.getRepositoryName(objectType);
        const prefix = objectType.toUpperCase().slice(0, 3);
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
    async create(objectType, tenantId, data) {
        var _a, _b;
        if (objectType === 'brand-lookups') {
            const repo = await this.app.get('repositories.BrandLookupRepository');
            return repo.create(data);
        }
        data.tenant_id = tenantId;
        const customId = await this.generateCustomId(objectType);
        data.id = customId;
        if (objectType === 'styles') {
            data.code = customId;
        }
        const schemaDef = await this.app.get('repositories.TenantSchemaRepository').then(repo => repo.findOne({
            where: { tenant_id: tenantId, object_type: objectType.endsWith('s') ? objectType.slice(0, -1) : objectType, is_active: true },
        }));
        if (schemaDef && schemaDef.schema) {
            const singularObjectType = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
            if (singularObjectType === 'bom') {
                schemaDef.schema.additionalProperties = true;
                schemaDef.schema.required = [];
            }
            else if (singularObjectType === 'style') {
                schemaDef.schema.required = schemaDef.schema.required || [];
                schemaDef.schema.required = schemaDef.schema.required.filter((r) => r !== 'code');
            }
            const facts = { objectType, data };
            const events = await this.validatorService.runRules(facts);
            if (events.length > 0) {
                throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(events));
            }
        }
        if (objectType === 'styles') {
            const styleData = data.data || {};
            if (styleData.brand === 'Nike' && !styleData.season) {
                styleData.season = 'SS25';
            }
            if (styleData.brand === 'Adidas' && !styleData.season) {
                styleData.season = 'FW25';
            }
            data.data = styleData;
        }
        if (objectType === 'boms') {
            if (data.cost > 1000 && !((_a = data.data) === null || _a === void 0 ? void 0 : _a.priority)) {
                data.data = data.data || {};
                data.data.priority = 'high';
            }
        }
        data.updated_at = new Date().toISOString();
        const errors = [];
        if (data.name && data.name.length < 3) {
            errors.push({ keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.' });
        }
        if (objectType === 'styles' && ((_b = data.data) === null || _b === void 0 ? void 0 : _b.brand)) {
            const brandLookupRepo = await this.app.get('repositories.BrandLookupRepository');
            const allowedBrands = await brandLookupRepo.find({ where: { tenant_id: tenantId, is_active: true } });
            if (allowedBrands.length > 0) {
                const brandNames = allowedBrands.map(b => b.name);
                if (!brandNames.includes(data.data.brand)) {
                    errors.push({ keyword: 'brandValidation', message: `Brand must be one of: ${brandNames.join(', ')}.` });
                }
            }
        }
        if (data.data && data.data.hit && (data.data.hit < 1 || data.data.hit > 12)) {
            errors.push({ keyword: 'hitValue', message: 'Hit value must be between 1 and 12.' });
        }
        if (errors.length > 0) {
            throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(errors));
        }
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        return repo.create(data);
    }
    async find(objectType, tenantId, limit = 10, offset = 0) {
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        return repo.find({
            where: { tenant_id: tenantId },
            limit: Math.min(limit, 100),
            offset,
        });
    }
    async findById(objectType, id) {
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        return repo.findById(id);
    }
    async updateById(objectType, id, data) {
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
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
    tslib_1.__param(0, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__param(1, (0, core_1.inject)('services.ValidatorService')),
    tslib_1.__metadata("design:paramtypes", [core_1.Application,
        services_1.ValidatorService])
], GenericController);
//# sourceMappingURL=generic.controller.js.map