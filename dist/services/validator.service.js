"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository");
const _2020_1 = tslib_1.__importDefault(require("ajv/dist/2020"));
const ajv_formats_1 = tslib_1.__importDefault(require("ajv-formats"));
const repositories_1 = require("../repositories");
let ValidatorService = class ValidatorService {
    constructor() {
        this.validatorCache = new Map();
        this.ajv = new _2020_1.default({
            allErrors: true,
            useDefaults: true,
            coerceTypes: 'array',
        });
        (0, ajv_formats_1.default)(this.ajv);
        // --- ADDING CUSTOM VALIDATION KEYWORDS ---
        this.ajv.addKeyword({
            keyword: 'hitValue',
            errors: true,
            validate: function (schema, data) {
                const valid = data >= 1 && data <= 12;
                if (!valid) {
                    this.errors = [{ keyword: 'hitValue', message: 'hit value must be between 1 and 12' }];
                }
                return valid;
            }
        });
        this.ajv.addKeyword({
            keyword: 'nameValidation',
            errors: true,
            validate: function (schema, data) {
                const valid = data.length >= 3 && data.length <= 50;
                if (!valid) {
                    this.errors = [{ keyword: 'nameValidation', message: 'Name must be between 3 and 50 characters.' }];
                }
                return valid;
            }
        });
        this.ajv.addKeyword({
            keyword: 'brandValidation',
            errors: true,
            validate: function (schema, data) {
                const validBrands = ['Nike', 'Adidas', 'Puma', 'Fynd'];
                const valid = validBrands.includes(data);
                if (!valid) {
                    this.errors = [{ keyword: 'brandValidation', message: `Brand must be one of: ${validBrands.join(', ')}.` }];
                }
                return valid;
            }
        });
        this.ajv.addKeyword({
            keyword: 'seasonValue',
            errors: true,
            validate: function (schema, data) {
                const validSeasons = ['SS', 'FW', 'Spring', 'Summer', 'Fall', 'Winter'];
                const valid = validSeasons.includes(data);
                if (!valid) {
                    this.errors = [{ keyword: 'seasonValue', message: `Season must be one of: ${validSeasons.join(', ')}.` }];
                }
                return valid;
            }
        });
    }
    getAjv() {
        return this.ajv;
    }
};
exports.ValidatorService = ValidatorService;
tslib_1.__decorate([
    (0, repository_1.repository)(repositories_1.TenantSchemaRepository),
    tslib_1.__metadata("design:type", repositories_1.TenantSchemaRepository)
], ValidatorService.prototype, "tenantSchemaRepository", void 0);
exports.ValidatorService = ValidatorService = tslib_1.__decorate([
    (0, core_1.injectable)({ scope: core_1.BindingScope.TRANSIENT }),
    tslib_1.__metadata("design:paramtypes", [])
], ValidatorService);
//# sourceMappingURL=validator.service.js.map