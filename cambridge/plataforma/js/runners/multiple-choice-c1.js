// runners/multiple-choice-c1.js
import { saveResult } from '../auth.js';

let exercise = null;
let questionIndex = 0;
let answers = {};
let _skill = '';
let _part  = '';
let _exercises = [];

export function initMultipleChoiceC1(exercises, skill, part) {
  exercise      = null;
  questionIndex = 0;
  answers       = {};
  _skill        = skill;
  _part         = part;
  _exercises    = exercises;
  renderSelector();
}

function renderSelector() {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 1 — Multiple Choice Cloze (C1)</h1>
      <p class="page-subtitle">${_exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${_exercises.map((ex, i) => {
        // Adaptador para el texto de previsualización
        const previewText = ex.text_preview || ex.text || ex.reading_text || "";
        return `
          <div class="skill-card" data-i="${i}">
            <div class="skill-icon">📝</div>
            <div class="skill-name">${ex.title}</div>
            <div class="skill-desc">${previewText.substring(0, 80)}...</div>
            <div class="skill-arrow">Start →</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      exercise = _exercises[parseInt(card.dataset.i)];
      // Adaptador para las preguntas
      exercise.questions = exercise.questions || exercise.gaps;
      questionIndex = 0;
      answers       = {};
      renderQuestion();
    });
  });
}

function renderQuestion() {
  const c       = document.getElementById('ejercicio-content');
  const q       = exercise.questions[questionIndex];
  const marker  = `(${q.id}) ____`; // Cambiado de (questionIndex + 1) a q.id por seguridad
  const highlight = `<span style="color:var(--color-primary);font-weight:700">${marker}</span>`;
  
  // Adaptador para el texto principal
  const rawText = exercise.reading_text || exercise.text || "";
  
  const text    = rawText
    .replace(/<\/?(?:h2|p)>/g, '')
    .replace(marker, highlight);

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 1 — ${exercise.title}</h1>
      <p class="page-subtitle">Question ${questionIndex + 1} of ${exercise.questions.length}</p>
    </div>
    <div class="card" style="margin-bottom:1.5rem;line-height:1.8">
      <p style="text-align:left">${text}</p>
    </div>
    <div class="card">
      <div class="card-title">Choose the best word for the gap ${q.id}:</div>
      <div id="opts" style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1rem"></div>
      <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
        <button class="btn" id="btn-sel">← Selector</button>
        <button class="btn" id="btn-prev" ${questionIndex === 0 ? 'disabled' : ''}>← Previous</button>
        <button class="btn btn-primary" id="btn-next">
          ${questionIndex === exercise.questions.length - 1 ? 'Ver resultados' : 'Next →'}
        </button>
      </div>
    </div>
  `;

  document.getElementById('opts').replaceChildren(
    ...q.options.map((opt, idx) => {
      const sel = answers[q.id] === idx;
      const el  = document.createElement('div');
      // Estilos idénticos al runner de B2
      el.style.cssText = `padding:.75rem 1rem;border-radius:8px;border:2px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'};background:${sel ? 'rgba(99,102,241,.12)' : 'var(--color-surface)'};cursor:pointer;transition:all .15s;text-align:left`;
      el.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
      el.addEventListener('click', () => { 
        answers[q.id] = idx; 
        renderQuestion(); 
      });
      return el;
    })
  );

  document.getElementById('btn-sel').addEventListener('click', () => renderSelector());
  document.getElementById('btn-prev').addEventListener('click', () => { 
    questionIndex--; 
    renderQuestion(); 
  });
  document.getElementById('btn-next').addEventListener('click', () => {
    if (questionIndex === exercise.questions.length - 1) {
      finishQuiz();
    } else { 
      questionIndex++; 
      renderQuestion(); 
    }
  });
}

async function finishQuiz() {
  let correct = 0;
  exercise.questions.forEach(q => { 
    if (answers[q.id] === q.answer) correct++; 
  });
  
  const total = exercise.questions.length;
  const pct   = Math.round((correct / total) * 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  try {
    await saveResult({
      exam:       _skill,
      part:       parseInt(_part.replace('part', '')),
      exerciseId: exercise.title,
      score:      pct,
    });
  } catch(e) { 
    console.warn('Error guardando resultado:', e); 
  }

  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Results — ${exercise.title}</h1>
    </div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Correct</div>
        <div class="stat-value">${correct} / ${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Score</div>
        <div class="stat-value" style="color:${color}">${pct}%</div>
      </div>
    </div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn btn-primary" id="btn-review">Check answers</button>
      <button class="btn" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose another exercise</button>
      <button class="btn" id="btn-destreza">← Use of English</button>
    </div>
  `;

  document.getElementById('btn-review').addEventListener('click', () => showReview());
  document.getElementById('btn-repeat').addEventListener('click', () => { 
    questionIndex = 0; 
    answers = {}; 
    renderQuestion(); 
  });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector());
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

function showReview() {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Review — ${exercise.title}</h1>
    </div>
    <button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Return to results</button>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz());

  const list = document.getElementById('review-list');
  exercise.questions.forEach((q, i) => {
    const sel = answers[q.id];
    const ok  = sel === q.answer;
    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Question ${i + 1}: ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      <p><strong>Your answer:</strong> ${sel !== undefined ? q.options[sel] : '<em>Not answered</em>'}</p>
      <p><strong>Correct:</strong> <span style="color:#22c55e;font-weight:600">${q.options[q.answer]}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}