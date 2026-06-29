import React from 'react'
import { Question } from '../App'

type UploadProps = {
  onGenerated: (questions: Question[]) => void
}

export default function Upload({ onGenerated }: UploadProps){
  const [text, setText] = React.useState('')
  const [category, setCategory] = React.useState('Correct Spelling')
  const [status, setStatus] = React.useState('')
  const [categories, setCategories] = React.useState<string[]>(['Correct Spelling','Antonyms','Synonyms','General'])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!text.trim()) return alert('Paste question text first')
    setStatus('Submitting...')

    const res = await fetch('http://localhost:4001/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, category })
    })
    const data = await res.json()
    if(res.ok){
      setStatus(`Created ${data.created} questions`)
      const qres = await fetch(`http://localhost:4001/api/questions?category=${encodeURIComponent(category)}`)
      const qdata = await qres.json()
      onGenerated(qdata.questions)
    } else {
      setStatus('Error: '+(data.error||'unknown'))
    }
  }

  return (
    <div>
      <h2>Paste questions</h2>
      <p>Enter questions in the format shown below:</p>
      <pre style={{background:'#f3f3f3', padding:12}}>
1. Choose the Correct Spelling
A. bicycle
B. bycycle
C. bycicle
D. bicycle
      </pre>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category:</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{marginLeft:8}}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginTop:10}}>
          <textarea rows={12} cols={80} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste question text here" />
        </div>
        <div style={{marginTop:10}}>
          <button type="submit">Submit Questions</button>
        </div>
      </form>
      <div style={{marginTop:10}}>{status}</div>
    </div>
  )
}
