"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorService = void 0;
const json_rules_engine_1 = require("json-rules-engine");
class ValidatorService {
    constructor() {
        this.engine = new json_rules_engine_1.Engine();
        // Define rules for extensible models
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'objectType',
                        operator: 'equal',
                        value: 'boms'
                    },
                    {
                        fact: 'data',
                        path: '$.cost',
                        operator: 'greaterThan',
                        value: 1000
                    }
                ]
            },
            event: {
                type: 'high-cost-bom',
                params: {
                    message: 'BOM cost is high, triggering additional checks'
                }
            }
        });
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'objectType',
                        operator: 'equal',
                        value: 'styles'
                    },
                    {
                        fact: 'data',
                        path: '$.hit',
                        operator: 'greaterThan',
                        value: 10
                    }
                ]
            },
            event: {
                type: 'high-hit-style',
                params: {
                    message: 'Style hit is high, triggering additional actions'
                }
            }
        });
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'objectType',
                        operator: 'equal',
                        value: 'styles'
                    },
                    {
                        fact: 'data',
                        path: '$.brand',
                        operator: 'equal',
                        value: 'Nike'
                    }
                ]
            },
            event: {
                type: 'nike-brand',
                params: {
                    message: 'Style is Nike brand, triggering additional validations'
                }
            }
        });
    }
    getEngine() {
        return this.engine;
    }
    async runRules(facts) {
        const events = await this.engine.run(facts);
        return events.events;
    }
}
exports.ValidatorService = ValidatorService;
//# sourceMappingURL=validator.service.js.map