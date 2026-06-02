require('dotenv').config();
const { pool, init } = require('./db');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('houses.json'));

init().then(async () => {
    await pool.query('DELETE FROM houses_cache');
    await pool.query('INSERT INTO houses_cache (date, houses) VALUES ($1, $2)', [data.date, JSON.stringify(data.houses)]);
    console.log('Done! Seeded', data.houses.length, 'houses');
    process.exit(0);
}).catch(e => {
    console.error(e.message);
    process.exit(1);
});
