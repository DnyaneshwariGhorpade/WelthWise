const { pool } = require('../../config/db');
const { ApiError } = require('../../common/errors');
const { recalculateUser } = require('../../common/recalculate.service');

const TABLES = {
  income: 'incomes',
  expense: 'expenses',
  asset: 'assets',
  liability: 'liabilities',
  investment: 'investments',
};

const FIELDS = {
  income: ['source', 'amount', 'frequency'],
  expense: ['category', 'amount', 'frequency'],
  asset: ['asset_type', 'current_value', 'liquidity_level'],
  liability: ['liability_type', 'outstanding_amount', 'interest_rate'],
  investment: ['investment_type', 'amount_invested', 'risk_level'],
};

function assertType(type) {
  if (!TABLES[type]) throw new ApiError(422, `Unknown record type "${type}". Use one of: ${Object.keys(TABLES).join(', ')}.`);
}

async function getAll(userId, type) {
  if (type) {
    assertType(type);
    const result = await pool.query(`SELECT * FROM ${TABLES[type]} WHERE user_id = $1 ORDER BY 1 DESC`, [userId]);
    return { type, records: result.rows };
  }
  const out = {};
  for (const [key, table] of Object.entries(TABLES)) {
    const result = await pool.query(`SELECT * FROM ${table} WHERE user_id = $1 ORDER BY 1 DESC`, [userId]);
    out[key] = result.rows;
  }
  return out;
}

function mapPayload(type, body) {
  const allowed = FIELDS[type];
  const data = {};
  for (const f of allowed) {
    if (body[f] === undefined) throw new ApiError(422, `Field "${f}" is required for ${type} records`);
    data[f] = body[f];
  }
  if (data.amount !== undefined) data.amount = String(Number(data.amount).toFixed(2));
  if (data.current_value !== undefined) data.current_value = String(Number(data.current_value).toFixed(2));
  if (data.outstanding_amount !== undefined) data.outstanding_amount = String(Number(data.outstanding_amount).toFixed(2));
  if (data.amount_invested !== undefined) data.amount_invested = String(Number(data.amount_invested).toFixed(2));
  return data;
}

async function create(userId, type, body) {
  assertType(type);
  const table = TABLES[type];
  const data = mapPayload(type, body);
  const cols = ['user_id', ...Object.keys(data)];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const values = [userId, ...Object.values(data)];

  const result = await pool.query(
    `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values
  );

  await recalculateUser(userId);
  return result.rows[0];
}

async function update(userId, id, type, body) {
  assertType(type);
  const table = TABLES[type];
  const data = mapPayload(type, body);
  const cols = Object.keys(data);
  const set = cols.map((c, i) => `${c} = $${i + 2}`).join(', ');
  const result = await pool.query(
    `UPDATE ${table} SET ${set} WHERE user_id = $1 AND ${idColFor(table)} = $${cols.length + 2} RETURNING *`,
    [userId, ...Object.values(data), id]
  );
  if (!result.rowCount) throw new ApiError(404, 'Record not found');
  await recalculateUser(userId);
  return result.rows[0];
}

function idColFor(table) {
  return `${table.replace(/s$/, '')}_id`;
}

async function remove(userId, id, type) {
  assertType(type);
  const table = TABLES[type];
  const result = await pool.query(`DELETE FROM ${table} WHERE user_id = $1 AND ${idColFor(table)} = $2`, [userId, id]);
  if (!result.rowCount) throw new ApiError(404, 'Record not found');
  await recalculateUser(userId);
  return { deleted: id };
}

module.exports = { getAll, create, update, remove, TABLES };