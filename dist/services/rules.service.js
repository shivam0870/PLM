"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const json_rules_engine_1 = require("json-rules-engine");
let RulesService = class RulesService {
    constructor() { }
    async run(rules = [], facts = {}) {
        if (!rules || rules.length === 0)
            return facts;
        const engine = new json_rules_engine_1.Engine(rules);
        const out = { ...facts };
        engine.on('success', event => {
            if (event.params && event.params.assign) {
                Object.assign(out, event.params.assign);
            }
        });
        await engine.run(out);
        return out;
    }
};
exports.RulesService = RulesService;
exports.RulesService = RulesService = tslib_1.__decorate([
    (0, core_1.injectable)({ scope: core_1.BindingScope.TRANSIENT }),
    tslib_1.__metadata("design:paramtypes", [])
], RulesService);
//# sourceMappingURL=rules.service.js.map