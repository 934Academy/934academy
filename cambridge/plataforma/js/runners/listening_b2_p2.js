import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningB2Part2(exercises, skill, part) {
  exercise = null;
  answers = {};
  _skill = skill;
  _part = part;
  renderSelector(exercises);
}

function renderSelector(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Listening Part 2</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}" style="cursor:pointer">
          <div class="skill-icon">🎧</div>
          <div class="skill-name">${ex.title}</div>
          <div class="skill-desc">${ex.text_preview}</div>
          <div class="skill-arrow">Start →</div>
        </div>
      `).join('')}
    </div>
  `;

  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      exercise = exercises[parseInt(card.dataset.i, 10)];
      answers = {};
      renderExercise();
    });
  });
}

function renderExercise() {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Listening Part 2 — ${exercise.title}</h1>
      <p class="page-subtitle">${exercise.context}</p>
    </div>
    <audio controls preload="metadata" style="width:100%;margin-bottom:1.5rem;border-radius:8px">
      <source src="${exercise.audio}" type="audio/mpeg">
    </audio>
    <div style="display:flex;flex-direction:column;gap:1rem" id="questions-list"></div>
    <button class="btn btn-primary" id="btn-check" style="margin-top:1.5rem">Check Answers</button>
  `;

  const list = document.getElementById('questions-list');
  exercise.questions.forEach(q => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <p>${q.num}. ${q.text_before} 
         <input type="text" id="input_${q.id}" style="padding:4px; border:1px solid #ccc; border-radius:4px; width:150px"> 
         ${q.text_after}
      </p>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-check').addEventListener('click', () => {
    exercise.questions.forEach(q => {
      answers[q.id] = document.getElementById(`input_${q.id}`).value.trim().toLowerCase();
    });
    finishQuiz();
  });
}

async function finishQuiz() {
  let correct = 0;
  exercise.questions.forEach(q => {
    if (q.answers.map(a => a.toLowerCase()).includes(answers[q.id])) {
      correct++;
    }
  });

  const pct = Math.round((correct / exercise.questions.length) * 100);
  
  try {
    await saveResult({ exam: _skill, part: 2, exerciseId: exercise.title, score: pct });
  } catch (e) { console.warn(e); }

  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Results: ${pct}%</h1>
    </div>
    <div style="display:flex;gap:1rem;margin-bottom:2rem">
      <button class="btn btn-primary" id="btn-review">Review Answers</button>
      <button class="btn" id="btn-back">← Listening</button>
    </div>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  
  document.getElementById('btn-review').onclick = showReview;
  document.getElementById('btn-back').onclick = () => window.navigate('destreza', { skill: _skill });
}

function showReview() {
  const list = document.getElementById('review-list');
  list.innerHTML = exercise.questions.map(q => {
    const userAns = answers[q.id] || "";
    const isCorrect = q.answers.map(a => a.toLowerCase()).includes(userAns);
    
    return `
      <div class="card" style="border-left: 4px solid ${isCorrect ? '#22c55e' : '#ef4444'}">
        <p><strong>${q.num}. ${q.text_before} <u>${userAns || '<em>(empty)</em>'}</u> ${q.text_after}</strong></p>
        <p style="color: ${isCorrect ? '#22c55e' : '#ef4444'}">
          ${isCorrect ? '✅ Correct' : '❌ Incorrect'}
        </p>
        ${!isCorrect ? `<p><strong>Correct answer(s):</strong> ${q.answers.join(' / ')}</p>` : ''}
        <p style="background:#f8fafc; padding:0.5rem; margin-top:0.5rem">
          <strong>Explanation:</strong> ${q.explanation}
        </p>
      </div>
    `;
  }).join('');
}