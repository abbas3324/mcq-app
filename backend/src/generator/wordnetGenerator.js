function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a}

function pickRandom(arr,n){ const res=[]; const src = arr.slice(); while(res.length<n && src.length){ const i=Math.floor(Math.random()*src.length); res.push(src.splice(i,1)[0]); } return res }

// Simple template-based generator using word list and heuristics.
// NOTE: This is a placeholder implementation. Later replace with WordNet lookups.
module.exports.generateFromWords = function(words, options={perWord:true, types:['antonym']}){
  const instr = (options && options.instructions) ? String(options.instructions).toLowerCase() : '';
  const uniq = Array.from(new Set(words.map(w=>w.toLowerCase()).filter(Boolean)));
  const questions = [];
  for(const w of uniq){
    let type = 'antonym';
    if(/synonym|similar|same|match/.test(instr)) type = 'synonym';
    else if(/definition|meaning|describe/.test(instr)) type = 'definition';
    else if(/antonym|opposite|opposite of/.test(instr)) type = 'antonym';

    const correct = `${w}-${type}`; // placeholder correct value indicating requested type
    const distractors = pickRandom(uniq.filter(x=>x!==w), 3);
    const opts = [correct, ...distractors];
    shuffle(opts);
    const q = { word: w, type, correct, options: opts };
    if(instr) q.instructions = options.instructions;
    questions.push(q);
  }
  return questions;
}
