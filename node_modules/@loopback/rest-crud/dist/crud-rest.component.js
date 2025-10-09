"use strict";
// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudRestComponent = void 0;
const core_1 = require("@loopback/core");
const crud_rest_api_builder_1 = require("./crud-rest.api-builder");
class CrudRestComponent {
    constructor() {
        this.bindings = [(0, core_1.createBindingFromClass)(crud_rest_api_builder_1.CrudRestApiBuilder)];
    }
}
exports.CrudRestComponent = CrudRestComponent;
//# sourceMappingURL=crud-rest.component.js.map