import React from 'react'
import { Question } from '../App'

type ReviewProps = {
  questions: Question[]
  answers: Record<number, string>
}

export default function Review({ questions = [], answers = {} }: ReviewProps){
  if(!questions.length) return <div>No questions to review.</div>

  const score = questions.reduce((s, q) => s + ((answers[q.id] && answers[q.id] === q.correct) ? 1 : 0), 0)

  return (
    <div>
      <h2>Review</h2>
      <div style={{marginBottom:12}}>Score: <b>{score} / {questions.length}</b></div>
      <ol>
        {questions.map(q => (
          <li key={q.id} style={{marginBottom:12}}>
            <div style={{marginBottom:6}}><b>{q.question}</b> <span style={{color:'#555'}}>({q.type})</span></div>
            <div style={{display:'flex',flexDirection:'column'}}>
              {q.options.map((opt, i) => {
                const isCorrect = opt === q.correct
                const isSelected = answers[q.id] === opt
                const bg = isCorrect ? '#cfc' : (isSelected ? '#fcc' : '#fff')
                return (
                  <div key={i} style={{padding:6, marginBottom:4, background:bg, border:'1px solid #ddd', borderRadius:4}}>
                    {opt} {isCorrect && <span style={{color:'green', marginLeft:8}}>(correct)</span>} {isSelected && !isCorrect && <span style={{color:'red', marginLeft:8}}>(your answer)</span>}
                  </div>
                )
              })}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
