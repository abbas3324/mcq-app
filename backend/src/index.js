const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dbModule = require('./db');
const generator = require('./generator/wordnetGenerator');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    let text = '';
    const instructions = (req.body && req.body.instructions) ? req.body.instructions : '';
    if (req.file) {
      // try to treat as plain text
      text = req.file.buffer.toString('utf8');
    } else if (req.body.text) {
      text = req.body.text;
    }
    const words = text.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(Boolean);
    if (!words.length) return res.status(400).json({ error: 'No words found in upload' });

    const questions = generator.generateFromWords(words, { instructions });
    const db = dbModule.getDB();
    const insert = db.prepare('INSERT INTO questions (word, type, correct, options) VALUES (?,?,?,?)');
    const insertMany = db.transaction((qs) => { qs.forEach(q => insert.run(q.word, q.type, q.correct, JSON.stringify(q.options))); });
    insertMany(questions);
    res.json({ created: questions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/questions', (req, res) => {
  const db = dbModule.getDB();
  const rows = db.prepare('SELECT id, word, type, correct, options FROM questions').all();
  const formatted = rows.map(r => ({ id: r.id, word: r.word, type: r.type, correct: r.correct, options: JSON.parse(r.options) }));
  res.json({ count: formatted.length, questions: formatted });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
