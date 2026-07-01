import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningB2Part3(exercises, skill, part) {
  exercise = exercises[0]; // Asumimos un solo set de 5 extractos
  answers = {};
  _skill = skill;
  _part = part;
  renderExercise();
}

function renderExercise() {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Listening Part 3 — ${exercise.title}</h1>
      <p class="page-subtitle">Choose the correct opinion (A-H) for each speaker.</p>
    </div>
    <audio controls src="${exercise.audio}" style="width:100%; margin-bottom:1rem;"></audio>
    <div id="q-list" style="display:flex; flex-direction:column; gap:1rem;"></div>
    <button class="btn btn-primary" id="btn-check" style="margin-top:1rem">Check Answers</button>
  `;

  const list = document.getElementById('q-list');
  const optionsHtml = Object.entries(exercise.options).map(([key, val]) => `<option value="${key}">${key}: ${val}</option>`).join('');

  exercise.questions.forEach(q => {
    list.innerHTML += `
      <div class="card">
        <label><strong>${q.speaker}:</strong></label>
        <select id="sel_${q.id}" style="padding:5px; margin-left:10px">
          <option value="">Select option...</option>
          ${optionsHtml}
        </select>
      </div>
    `;
  });

  document.getElementById('btn-check').onclick = () => {
    exercise.questions.forEach(q => answers[q.id] = document.getElementById(`sel_${q.id}`).value);
    finishQuiz();
  };
}

async function finishQuiz() {
  let correct = 0;
  exercise.questions.forEach(q => {
    if (answers[q.id] === q.answer) correct++;
  });

  const pct = Math.round((correct / exercise.questions.length) * 100);
  const c = document.getElementById('ejercicio-content');
  
  c.innerHTML = `
    <div class="page-header"><h1>Results: ${pct}%</h1></div>
    <button class="btn btn-primary" id="btn-review">Review Answers</button>
    <button class="btn" onclick="location.reload()">Back</button>
    <div id="review-list" style="margin-top:1rem"></div>
  `;

  document.getElementById('btn-review').onclick = () => {
    const list = document.getElementById('review-list');
    list.innerHTML = exercise.questions.map(q => `
      <div class="card" style="border-left: 4px solid ${answers[q.id] === q.answer ? '#22c55e' : '#ef4444'}">
        <p><strong>${q.speaker}:</strong> You chose ${answers[q.id] || 'none'}. 
        ${answers[q.id] === q.answer ? '✅' : '❌ Correct was ' + q.answer}</p>
        <p><em>${q.explanation || ''}</em></p>
      </div>
    `).join('');
  };

  await saveResult({ exam: _skill, part: 3, exerciseId: exercise.title, score: pct });
}