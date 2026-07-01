import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningB2Part4(exercises, skill, part) {
  exercise = exercises[0];
  answers = {};
  _skill = skill;
  _part = part;
  renderExercise();
}

function renderExercise() {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header"><h1 class="page-title">${exercise.title}</h1></div>
    <audio controls src="${exercise.audio}" style="width:100%"></audio>
    <div id="q-list" style="margin-top:1rem"></div>
    <button class="btn btn-primary" id="btn-check" style="margin-top:1rem">Check Answers</button>
  `;
  
  const list = document.getElementById('q-list');
  exercise.questions.forEach(q => {
    list.innerHTML += `
      <div class="card" style="margin-bottom:1rem">
        <p><strong>${q.num}. ${q.question}</strong></p>
        ${q.options.map((opt, i) => `
          <label style="display:block; margin-bottom:0.5rem; cursor:pointer">
            <input type="radio" name="${q.id}" value="${i}"> ${String.fromCharCode(65 + i)}. ${opt}
          </label>
        `).join('')}
      </div>
    `;
  });

  document.getElementById('btn-check').onclick = () => {
    exercise.questions.forEach(q => {
      const checked = document.querySelector(`input[name="${q.id}"]:checked`);
      answers[q.id] = checked ? parseInt(checked.value) : -1;
    });
    finishQuiz();
  };
}

async function finishQuiz() {
  let correct = 0;
  exercise.questions.forEach(q => {
    if (answers[q.id] === q.answer) correct++;
  });
  
  const pct = Math.round((correct / exercise.questions.length) * 100);
  
  try {
    await saveResult({ exam: _skill, part: 4, exerciseId: exercise.title, score: pct });
  } catch (e) { console.warn(e); }

  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Results: ${pct}%</h1>
    </div>
    <div style="display:flex;gap:1rem;margin-bottom:2rem">
      <button class="btn btn-primary" id="btn-review">Review Answers</button>
      <button class="btn" onclick="location.reload()">Back</button>
    </div>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  
  document.getElementById('btn-review').onclick = showReview;
}

function showReview() {
  const list = document.getElementById('review-list');
  list.innerHTML = exercise.questions.map(q => {
    const userVal = answers[q.id];
    const isCorrect = userVal === q.answer;
    
    return `
      <div class="card" style="border-left: 4px solid ${isCorrect ? '#22c55e' : '#ef4444'}">
        <p><strong>${q.num}. ${q.question}</strong></p>
        <p style="color: ${isCorrect ? '#22c55e' : '#ef4444'}">
          ${isCorrect ? '✅ Correct' : '❌ Incorrect'}
        </p>
        <p><strong>Your answer:</strong> ${userVal >= 0 ? String.fromCharCode(65 + userVal) : 'Not answered'}</p>
        <p><strong>Correct answer:</strong> ${String.fromCharCode(65 + q.answer)}</p>
      </div>
    `;
  }).join('');
}