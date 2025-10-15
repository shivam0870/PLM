"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bom = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let Bom = class Bom extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
exports.Bom = Bom;
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
], Bom.prototype, "id", void 0);
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
], Bom.prototype, "tenant_id", void 0);
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
], Bom.prototype, "name", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'style_id',
            dataType: 'text',
        },
    }),
    tslib_1.__metadata("design:type", String)
], Bom.prototype, "style_id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'number',
        required: false,
        postgresql: {
            columnName: 'cost',
            dataType: 'numeric',
        },
    }),
    tslib_1.__metadata("design:type", Number)
], Bom.prototype, "cost", void 0);
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
], Bom.prototype, "data", void 0);
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
], Bom.prototype, "created_at", void 0);
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
], Bom.prototype, "updated_at", void 0);
exports.Bom = Bom = tslib_1.__decorate([
    (0, repository_1.model)({ settings: { strict: false, postgresql: { schema: 'public', table: 'boms' } } }),
    tslib_1.__metadata("design:paramtypes", [Object])
], Bom);
//# sourceMappingURL=bom.model.js.map