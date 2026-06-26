const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data.db'));

// Initialize tables
db.exec(`
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT,
  type TEXT,
  correct TEXT,
  options TEXT
);
`);

module.exports = {
  getDB: () => db
};
