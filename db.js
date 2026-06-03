const { Pool } = require('pg');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) : 'UNDEFINED');

const isExternalDB = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('railway.internal');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isExternalDB ? { rejectUnauthorized: false } : false
});

async function init() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS submissions (
            id        SERIAL PRIMARY KEY,
            name      TEXT NOT NULL,
            email     TEXT NOT NULL,
            subject   TEXT NOT NULL,
            message   TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS poems (
            id        TEXT PRIMARY KEY,
            words     JSONB NOT NULL,
            poem      TEXT NOT NULL,
            theme     TEXT,
            image_url TEXT,
            score     INTEGER DEFAULT 0,
            timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS houses_cache (
            id         SERIAL PRIMARY KEY,
            date       TEXT NOT NULL,
            houses     JSONB NOT NULL,
            fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
    console.log('Database tables ready');
}

module.exports = { pool, init };
