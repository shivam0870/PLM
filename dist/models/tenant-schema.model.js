"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSchema = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let TenantSchema = class TenantSchema extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
exports.TenantSchema = TenantSchema;
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'tenant_id',
            dataType: 'uuid',
        },
    }),
    tslib_1.__metadata("design:type", String)
], TenantSchema.prototype, "tenant_id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'object_type',
            dataType: 'text',
        },
    }),
    tslib_1.__metadata("design:type", String)
], TenantSchema.prototype, "object_type", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'number',
        id: true,
        generated: false,
        required: true,
        postgresql: {
            columnName: 'version',
            dataType: 'integer',
        },
    }),
    tslib_1.__metadata("design:type", Number)
], TenantSchema.prototype, "version", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'boolean',
        required: true,
        postgresql: {
            columnName: 'is_active',
            dataType: 'boolean',
        },
    }),
    tslib_1.__metadata("design:type", Boolean)
], TenantSchema.prototype, "is_active", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'object',
        required: true,
        postgresql: {
            columnName: 'schema',
            dataType: 'jsonb',
        },
    }),
    tslib_1.__metadata("design:type", Object)
], TenantSchema.prototype, "schema", void 0);
exports.TenantSchema = TenantSchema = tslib_1.__decorate([
    (0, repository_1.model)({ settings: { postgresql: { schema: 'public', table: 'tenant_schemas' } } }),
    tslib_1.__metadata("design:paramtypes", [Object])
], TenantSchema);
//# sourceMappingURL=tenant-schema.model.js.map