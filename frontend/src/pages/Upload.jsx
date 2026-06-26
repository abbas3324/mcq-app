import React from 'react'

export default function Upload({ onGenerated }){
  const [file, setFile] = React.useState(null)
  const [status, setStatus] = React.useState('')
  const [instructions, setInstructions] = React.useState('')

  const handleSubmit = async (e) =>{
    e.preventDefault()
    if(!file) return alert('Choose a file')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('instructions', instructions)
    setStatus('Uploading...')
    const res = await fetch('http://localhost:4000/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if(res.ok){
      setStatus(`Created ${data.created} questions`)
      // fetch questions
      const qres = await fetch('http://localhost:4000/api/questions')
      const qdata = await qres.json()
      onGenerated(qdata.questions)
    } else {
      setStatus('Error: '+(data.error||'unknown'))
    }
  }

  return (
    <div>
      <h2>Upload word list (.docx or text)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".txt,.docx" onChange={(e)=>setFile(e.target.files[0])} />
        <div style={{marginTop:8}}>
          <label style={{display:'block', marginBottom:6}}>Generation instructions (example: "create antonyms with 3 distractors")</label>
          <textarea rows={3} cols={40} value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="E.g. generate antonyms" />
        </div>
        <div style={{marginTop:10}}>
          <button type="submit">Upload & Generate</button>
        </div>
      </form>
      <div style={{marginTop:10}}>{status}</div>
    </div>
  )
}
