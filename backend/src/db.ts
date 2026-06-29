import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(__dirname, '..', 'data.db')
const db = new Database(dbPath)

// Ensure the questions table has the expected schema. If the existing table
// doesn't have a `question` column (legacy schema), recreate it.
try {
  const cols = db.prepare("PRAGMA table_info('questions')").all()
  const hasQuestion = Array.isArray(cols) && cols.some((c: any) => c.name === 'question')
  if (!hasQuestion) {
    db.exec('DROP TABLE IF EXISTS questions')
  }
} catch (err) {
  // ignore; if the table doesn't exist we'll create it below
}

db.exec(`
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT,
  type TEXT,
  correct TEXT,
  options TEXT
);
`)

export default {
  getDB: () => db
}
