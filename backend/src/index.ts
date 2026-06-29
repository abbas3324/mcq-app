import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dbModule from './db'

const app = express()
app.use(cors())
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage() })

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/questions', async (req, res) => {
  try {
    const { text = '', category = 'General' } = req.body as { text?: string, category?: string }
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Question text is required' })
    }

    const lines = String(text).split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    if (lines.length < 5) {
      return res.status(400).json({ error: 'Please provide at least one question and four choices' })
    }

    const questionsToInsert: Array<{ question: string, type: string, correct: string, options: string[] }> = []
    let currentQuestion = ''
    let currentOptions: string[] = []

    const pushQuestion = () => {
      if (!currentQuestion || currentOptions.length < 4) return
      const options = currentOptions.slice(0, 4)
      const correct = options[0]
      questionsToInsert.push({ question: currentQuestion, type: category, correct, options })
      currentQuestion = ''
      currentOptions = []
    }

    for (const line of lines) {
      if (/^\d+\./.test(line)) {
        pushQuestion()
        currentQuestion = line.replace(/^\d+\./, '').trim()
      } else if (/^[ABCD]\./i.test(line)) {
        currentOptions.push(line.replace(/^[ABCD]\./i, '').trim())
      } else if (!currentQuestion) {
        currentQuestion = line
      } else {
        if (currentOptions.length < 4) currentOptions.push(line)
      }
    }
    pushQuestion()

    if (!questionsToInsert.length) {
      return res.status(400).json({ error: 'No valid questions were found in the text' })
    }

    const db = dbModule.getDB()
    const insert = db.prepare('INSERT INTO questions (question, type, correct, options) VALUES (?,?,?,?)')
    const insertMany = db.transaction((qs: Array<{ question: string, type: string, correct: string, options: string[] }>) => {
      qs.forEach(q => insert.run(q.question, q.type, q.correct, JSON.stringify(q.options)))
    })
    insertMany(questionsToInsert)

    res.json({ created: questionsToInsert.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: (err as Error).message })
  }
})

app.get('/api/questions', (req, res) => {
  const category = String(req.query.category || '')
  const db = dbModule.getDB()
  let rows
  if (category) {
    rows = db.prepare('SELECT id, question, type, correct, options FROM questions WHERE type = ?').all(category)
  } else {
    rows = db.prepare('SELECT id, question, type, correct, options FROM questions').all()
  }

  const formatted = rows.map((r: any) => ({
    id: r.id,
    question: r.question,
    type: r.type,
    correct: r.correct,
    options: JSON.parse(r.options)
  }))
  res.json({ count: formatted.length, questions: formatted })
})

app.get('/api/categories', (_req, res) => {
  const db = dbModule.getDB()
  const rows = db.prepare('SELECT DISTINCT type FROM questions').all()
  res.json({ categories: rows.map((r: any) => r.type) })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`))
