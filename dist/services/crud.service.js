"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
let CrudService = class CrudService {
    constructor(app) {
        this.app = app;
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
    getRepositoryName(objectType) {
        const singular = objectType.endsWith('s') ? objectType.slice(0, -1) : objectType;
        const pascalCase = singular
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        return pascalCase + 'Repository';
    }
};
exports.CrudService = CrudService;
exports.CrudService = CrudService = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__metadata("design:paramtypes", [core_1.Application])
], CrudService);
//# sourceMappingURL=crud.service.js.map