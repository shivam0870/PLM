import {FyndPlmApiApplication} from './application';

const app = new FyndPlmApiApplication();
app.boot().then(() => {
  return app.migrateSchema();
}).then(() => {
  console.log('Migration completed');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed', err);
  process.exit(1);
});
