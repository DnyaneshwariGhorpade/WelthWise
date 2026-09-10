require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../database/migrations');

async function run() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
  } catch (err) {
    console.error('Could not connect to the database.');
    console.error(`  Target: ${(process.env.DIRECT_URL || process.env.DATABASE_URL).replace(/:[^:@]+@/, ':***@')}`);
    console.error(`  Reason: ${err.message}`);
    console.error('  Check that your machine can reach the Supabase pooler (ports 5432/6543) and that the password is correct.');
    await client.end().catch(() => {});
    process.exit(1);
  }

  try {

    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        filename    VARCHAR(255) NOT NULL UNIQUE,
        applied_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows } = await client.query('SELECT filename FROM _migrations');
    const applied = new Set(rows.map((r) => r.filename));

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`SKIP  ${file} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`RUN   ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`DONE  ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
    console.log('All migrations up to date.');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});