"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("./application");
const app = new application_1.FyndPlmApiApplication();
app.boot().then(() => {
    return app.migrateSchema();
}).then(() => {
    console.log('Migration completed');
    process.exit(0);
}).catch(err => {
    console.error('Migration failed', err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map