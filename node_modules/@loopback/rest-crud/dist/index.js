"use strict";
// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineCrudRepositoryClass = void 0;
const tslib_1 = require("tslib");
/**
 * REST API controller implementing default CRUD semantics.
 *
 * @remarks
 * Allows LoopBack 4 applications to quickly expose models via REST API without
 * having to implement custom controller or repository classes.
 *
 * @packageDocumentation
 */
// Re-export `defineCrudRepositoryClass` for backward-compatibility
var repository_1 = require("@loopback/repository");
Object.defineProperty(exports, "defineCrudRepositoryClass", { enumerable: true, get: function () { return repository_1.defineCrudRepositoryClass; } });
tslib_1.__exportStar(require("./crud-rest.api-builder"), exports);
tslib_1.__exportStar(require("./crud-rest.component"), exports);
tslib_1.__exportStar(require("./crud-rest.controller"), exports);
//# sourceMappingURL=index.js.map