require('dotenv').config();
const { pool, init } = require('./db');
const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('houses.json'));
const today = new Date().toDateString();

init().then(async () => {
    await pool.query('DELETE FROM houses_cache');
    await pool.query('INSERT INTO houses_cache (date, houses) VALUES ($1, $2)', [today, JSON.stringify(raw.houses)]);
    console.log('Done! Seeded', raw.houses.length, 'houses with date:', today);
    process.exit(0);
}).catch(e => {
    console.error(e.message);
    process.exit(1);
});
