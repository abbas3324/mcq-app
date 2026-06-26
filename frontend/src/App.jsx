import React from 'react'
import Upload from './pages/Upload'
import Exam from './pages/Exam'
import Review from './pages/Review'

export default function App(){
  const [view, setView] = React.useState('upload')
  const [questions, setQuestions] = React.useState([])
  const [answers, setAnswers] = React.useState({})
  const [settings, setSettings] = React.useState({ numQuestions: 20, timePerQuestion: 60 })

  const handleFinish = (ans) =>{
    setAnswers(ans || {})
    setView('review')
  }

  return (
    <div style={{padding:20,fontFamily:'Arial, sans-serif'}}>
      <h1>Kids MCQ Test App</h1>

      {view==='upload' && (
        <div>
          <div style={{marginBottom:12}}>
            <label style={{marginRight:8}}>Questions per exam:</label>
            <input type="number" value={settings.numQuestions} min={1} max={100} onChange={e=>setSettings(s=>({...s, numQuestions: Number(e.target.value)||1}))} />
            <label style={{marginLeft:12, marginRight:8}}>Seconds per question:</label>
            <input type="number" value={settings.timePerQuestion} min={5} max={3600} onChange={e=>setSettings(s=>({...s, timePerQuestion: Number(e.target.value)||30}))} />
          </div>
          <Upload onGenerated={(qs)=>{ setQuestions(qs); setView('exam') }} />
        </div>
      )}

      {view==='exam' && <Exam questions={questions} settings={settings} onFinish={handleFinish} />}

      {view==='review' && <Review questions={questions} answers={answers} />}

      <div style={{marginTop:20}}>
        <button onClick={()=>setView('upload')}>Upload / Settings</button>
      </div>
    </div>
  )
}
