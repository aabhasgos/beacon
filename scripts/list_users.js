const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data', 'beacon.db'));

console.log(db.prepare('SELECT id, email, full_name, college FROM users').all());
