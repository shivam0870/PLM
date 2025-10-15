"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Style = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let Style = class Style extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
exports.Style = Style;
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
], Style.prototype, "tenant_id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        id: true,
        postgresql: {
            columnName: 'id',
            dataType: 'text',
        },
    }),
    tslib_1.__metadata("design:type", String)
], Style.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: false,
        postgresql: {
            columnName: 'code',
            dataType: 'text',
        },
    }),
    tslib_1.__metadata("design:type", String)
], Style.prototype, "code", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'name',
            dataType: 'text',
        },
    }),
    tslib_1.__metadata("design:type", String)
], Style.prototype, "name", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'status',
            dataType: 'text',
        },
    }),
    tslib_1.__metadata("design:type", String)
], Style.prototype, "status", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'object',
        required: true,
        postgresql: {
            columnName: 'data',
            dataType: 'jsonb',
        },
    }),
    tslib_1.__metadata("design:type", Object)
], Style.prototype, "data", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        required: false,
        generated: true,
        postgresql: {
            columnName: 'created_at',
        },
    }),
    tslib_1.__metadata("design:type", String)
], Style.prototype, "created_at", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'date',
        required: false,
        generated: true,
        postgresql: {
            columnName: 'updated_at',
        },
    }),
    tslib_1.__metadata("design:type", String)
], Style.prototype, "updated_at", void 0);
exports.Style = Style = tslib_1.__decorate([
    (0, repository_1.model)({ settings: { strict: false, postgresql: { schema: 'public', table: 'styles' } } }),
    tslib_1.__metadata("design:paramtypes", [Object])
], Style);
//# sourceMappingURL=style.model.js.map