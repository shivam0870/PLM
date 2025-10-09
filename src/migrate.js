import fs from 'fs';
import path from 'path';
import url from 'url';
import { pool } from './db.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationsTable() {
  await pool.query(`
    create table if not exists _migrations (
      id serial primary key,
      name text not null unique,
      applied_at timestamptz not null default now()
    );
  `);
}

async function appliedNames() {
  const { rows } = await pool.query('select name from _migrations order by id');
  return new Set(rows.map(r => r.name));
}

async function run() {
  await ensureMigrationsTable();
  const applied = await appliedNames();
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    if (applied.has(f)) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log('Applying migration', f);
    await pool.query(sql);
    await pool.query('insert into _migrations(name) values($1)', [f]);
  }
  console.log('Migrations complete');
  await pool.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
