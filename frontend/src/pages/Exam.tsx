import React from 'react'
import { Question } from '../App'

type ExamProps = {
  questions: Question[]
  onFinish: (answers: Record<number, string>) => void
  settings: { numQuestions: number, timePerQuestion: number }
}

function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Exam({ questions = [], onFinish, settings }: ExamProps){
  const [index, setIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = React.useState(settings.timePerQuestion)

  if(!questions.length) return <div>No questions yet. Paste questions first.</div>

  const qs = React.useMemo(() => {
    const pool = questions.slice()
    shuffle(pool)
    return pool.slice(0, Math.min(settings.numQuestions || 20, pool.length))
  }, [questions, settings.numQuestions])

  const q = qs[index]

  React.useEffect(() => {
    setTimeLeft(settings.timePerQuestion)
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(iv)
          setTimeout(() => {
            handleTimeout()
          }, 0)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, qs.length, settings.timePerQuestion])

  const select = (opt: string) => {
    setAnswers(a => ({ ...a, [q.id]: opt }))
  }

  const handleTimeout = () => {
    if (index < qs.length - 1) {
      setIndex(i => i + 1)
    } else {
      onFinish(answers)
    }
  }

  const next = () => {
    if (index < qs.length - 1) {
      setIndex(index + 1)
    } else {
      onFinish(answers)
    }
  }

  return (
    <div>
      <h3>Question {index + 1} / {qs.length}</h3>
      <div style={{fontSize:20, marginBottom:8}}>Time left: <b>{timeLeft}s</b></div>
      <div style={{fontSize:20, marginBottom:10}}>{q.question}</div>
      <div>
        {q.options.map((o, i) => (
          <div key={i} style={{margin:6}}>
            <button onClick={() => select(o)} style={{padding:10, minWidth:200, background: answers[q.id]===o ? '#aaf' : '#eee'}}>{o}</button>
          </div>
        ))}
      </div>
      <div style={{marginTop:12}}>
        <button onClick={next}>{index < qs.length - 1 ? 'Next' : 'Finish'}</button>
      </div>
    </div>
  )
}
