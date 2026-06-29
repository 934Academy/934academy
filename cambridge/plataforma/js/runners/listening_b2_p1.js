import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningB2Part1(exercises, skill, part) {
  exercise = null;
  answers = {};
  _skill = skill;
  _part = part;
  renderSelector(exercises);
}

// ... (Reutiliza la lógica de renderSelector de tus runners anteriores) ...

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 1 — ${exercise.title}</h1>
      <audio controls src="${exercise.audio}" style="width:100%; margin-top:1rem;"></audio>
    </div>
    <div id="questions-list"></div>
    <button class="btn btn-primary" id="btn-check" style="margin-top:1rem">Check Answers</button>
  `;

  const list = document.getElementById('questions-list');
  exercise.questions.forEach((q) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <p><strong>${q.num}. ${q.question}</strong></p>
      ${q.options.map((opt, j) => `
        <label style="display:block; margin: 0.5rem 0; cursor:pointer">
          <input type="radio" name="q_${q.id}" value="${j}"> ${opt}
        </label>
      `).join('')}
    `;
    list.appendChild(div);
  });
  
  document.getElementById('btn-check').addEventListener('click', () => {
    exercise.questions.forEach(q => {
        const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
        answers[q.id] = selected ? parseInt(selected.value) : -1;
    });
    // Llama a tu función de corrección (puedes usar la misma estructura de la Part 2/3)
    finishQuiz(exercises);
  });
}