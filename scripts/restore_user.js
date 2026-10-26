const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data', 'beacon.db'));

db.prepare("DELETE FROM users WHERE id IN ('usr_google_1792905827589', 'usr_1792910445879')").run();

db.prepare(`
  UPDATE users SET
    full_name = 'Arjun Sharma',
    email = 'arjun.sharma@nitk.edu.in',
    college = 'National Institute of Technology Karnataka (NITK)',
    degree = 'B.Tech Computer Science & Engineering',
    graduation_year = 2027,
    cgpa = 8.85,
    headline = 'Pre-final Year B.Tech CSE @ NIT Karnataka | Full Stack & AI Enthusiast'
  WHERE id = 'usr_student_01'
`).run();

console.log('Users after cleanup:', db.prepare('SELECT id, email, full_name FROM users').all());
