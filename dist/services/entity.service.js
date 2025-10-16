"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const validator_service_1 = require("./validator.service");
let EntityService = class EntityService {
    constructor(app, validatorService) {
        this.app = app;
        this.validatorService = validatorService;
    }
    async create(objectType, tenantId, data) {
        var _a;
        // Special case for brand-lookups
        if (objectType === 'brand-lookups') {
            const repo = await this.app.get('repositories.BrandLookupRepository');
            return repo.create(data);
        }
        // Generic logic for other objects
        data.tenant_id = tenantId;
        const customId = await this.generateCustomId(objectType);
        data.id = customId;
        if (objectType === 'styles') {
            data.code = customId;
        }
        // --- ONLY JSON Rules Engine Validation ---
        const facts = {
            objectType,
            tenantId,
            name: data.name,
            data: data.data || {},
        };
        const ruleErrors = await this.validatorService.runRules(facts);
        if (ruleErrors.length > 0) {
            throw new rest_1.HttpErrors.UnprocessableEntity(JSON.stringify(ruleErrors));
        }
        // --- Custom Business Logic ---
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
        const repoName = this.getRepositoryName(objectType);
        const repo = await this.app.get(`repositories.${repoName}`);
        return repo.create(data);
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
    getRepositoryName(objectType) {
        const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
        const pascalCase = singular
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        return pascalCase + 'Repository';
    }
};
exports.EntityService = EntityService;
exports.EntityService = EntityService = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__param(1, (0, core_1.inject)('services.ValidatorService')),
    tslib_1.__metadata("design:paramtypes", [core_1.Application,
        validator_service_1.ValidatorService])
], EntityService);
//# sourceMappingURL=entity.service.js.map