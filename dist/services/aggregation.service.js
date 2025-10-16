"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
let AggregationService = class AggregationService {
    constructor(app) {
        this.app = app;
    }
    async aggregate(primaryObjectType, secondaryObjectType, limit, offset, relationField, tenantId) {
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
    getRepositoryName(objectType) {
        const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
        const pascalCase = singular
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        return pascalCase + 'Repository';
    }
};
exports.AggregationService = AggregationService;
exports.AggregationService = AggregationService = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__metadata("design:paramtypes", [core_1.Application])
], AggregationService);
//# sourceMappingURL=aggregation.service.js.map