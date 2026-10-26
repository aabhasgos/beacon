const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'beacon.db');
const db = new Database(dbPath);

try {
  db.exec("ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'password123'");
  console.log("Added password column successfully!");
} catch (e) {
  console.log("Column alter result:", e.message);
}

const cols = db.prepare("PRAGMA table_info(users)").all();
console.log("Users columns:", cols.map(c => c.name));
