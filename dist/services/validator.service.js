"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const json_rules_engine_1 = require("json-rules-engine");
let ValidatorService = class ValidatorService {
    constructor(app) {
        this.app = app;
        this.engine = new json_rules_engine_1.Engine();
        this.addOperators();
        this.addRules();
    }
    addOperators() {
        // Standard operators
        this.engine.addOperator('equal', (factValue, jsonValue) => factValue === jsonValue);
        this.engine.addOperator('greaterThan', (factValue, jsonValue) => factValue > jsonValue);
        this.engine.addOperator('lessThan', (factValue, jsonValue) => factValue < jsonValue);
        // Custom operator for string length validation
        this.engine.addOperator('lengthLessThan', (factValue, jsonValue) => {
            return !!(factValue && factValue.length < jsonValue);
        });
        this.engine.addOperator('lengthGreaterThan', (factValue, jsonValue) => {
            return !!(factValue && factValue.length > jsonValue);
        });
    }
    addRules() {
        // Rule: Name length validation - FIXED
        this.engine.addRule({
            conditions: {
                any: [
                    { fact: 'name', operator: 'lengthLessThan', value: 3 },
                    { fact: 'name', operator: 'lengthGreaterThan', value: 50 },
                ],
            },
            event: {
                type: 'validation-error',
                params: {
                    field: 'name',
                    message: 'Name must be between 3 and 50 characters.',
                },
            },
        });
        // Rule: Hit value range validation
        this.engine.addRule({
            conditions: {
                all: [
                    { fact: 'objectType', operator: 'equal', value: 'styles' },
                    {
                        any: [
                            { fact: 'data', path: '$.hit', operator: 'lessThan', value: 1 },
                            { fact: 'data', path: '$.hit', operator: 'greaterThan', value: 12 },
                        ],
                    },
                ],
            },
            event: {
                type: 'validation-error',
                params: {
                    field: 'data.hit',
                    message: 'Hit value must be between 1 and 12.',
                },
            },
        });
        // Rule: Brand validation - trigger if brand is not in allowed list
        this.engine.addRule({
            conditions: {
                all: [
                    { fact: 'objectType', operator: 'equal', value: 'styles' },
                    { fact: 'data', path: '$.brand', operator: 'notEqual', value: 'Nike' },
                    { fact: 'data', path: '$.brand', operator: 'notEqual', value: 'Adidas' },
                ],
            },
            event: {
                type: 'validation-error',
                params: {
                    field: 'data.brand',
                    message: 'Brand must be one of: Nike, Adidas.',
                },
            },
        });
    }
    async runRules(facts) {
        try {
            const { events } = await this.engine.run(facts);
            return events.map(e => e.params); // Return only the params for cleaner error messages
        }
        catch (error) {
            console.error('Rules engine error:', error);
            return [];
        }
    }
};
exports.ValidatorService = ValidatorService;
exports.ValidatorService = ValidatorService = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__metadata("design:paramtypes", [core_1.Application])
], ValidatorService);
//Move all the validation rules to here in  one file no explicit validation should be there
// only validation shoould be in terms of json-rules-engine
//we need to add one more thing in the avoiding garbage attributes - like in the data object brand can be there but brand1 cannot be there likewise season can be there but seazon1, seasones cannot be there so this also we have to change 
//# sourceMappingURL=validator.service.js.map