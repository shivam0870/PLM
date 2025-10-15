"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandLookup = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let BrandLookup = class BrandLookup extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
exports.BrandLookup = BrandLookup;
tslib_1.__decorate([
    (0, repository_1.property)({
        type: 'string',
        id: true,
        generated: true,
        postgresql: {
            columnName: 'id',
            dataType: 'uuid',
        },
    }),
    tslib_1.__metadata("design:type", String)
], BrandLookup.prototype, "id", void 0);
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
], BrandLookup.prototype, "name", void 0);
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
], BrandLookup.prototype, "is_active", void 0);
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
], BrandLookup.prototype, "created_at", void 0);
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
], BrandLookup.prototype, "updated_at", void 0);
exports.BrandLookup = BrandLookup = tslib_1.__decorate([
    (0, repository_1.model)({ settings: { strict: false, postgresql: { schema: 'public', table: 'brand_lookups' } } }),
    tslib_1.__metadata("design:paramtypes", [Object])
], BrandLookup);
//# sourceMappingURL=brand-lookup.model.js.map