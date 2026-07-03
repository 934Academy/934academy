import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningC1Part4(exercises, skill, part) {
  exercise = null; answers = {}; _skill = skill; _part = part;
  renderSelector(exercises);
}

function renderSelector(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 4 — Multiple Matching</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}"><div class="skill-icon">🎧</div><div class="skill-name">${ex.title}</div><div class="skill-arrow">Start →</div></div>
      `).join('')}
    </div>`;
  c.querySelectorAll('.skill-card').forEach(card => card.addEventListener('click', () => { exercise = exercises[parseInt(card.dataset.i)]; answers = {}; renderExercise(exercises); }));
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');
  
  const renderOptions = (options) => options.map(o => `<div><strong>${o.letter}</strong> ${o.text}</div>`).join('');
  const renderSelect = (qId, options) => `
    <select id="${qId}" style="padding: 4px; border-radius: 4px; border: 2px solid var(--color-primary); background: var(--color-surface); color: var(--color-text); font-weight: bold;">
      <option value="">-</option>
      ${options.map(o => `<option value="${o.letter}" ${answers[qId] === o.letter ? 'selected' : ''}>${o.letter}</option>`).join('')}
    </select>`;

  c.innerHTML = `
    <div class="page-header"><h1 class="page-title">Part 4 — ${exercise.title}</h1><p class="page-subtitle">${exercise.description}</p></div>
    <div style="background: var(--color-surface); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; border: 1px solid var(--color-border);">
       <audio controls style="width: 100%; max-width: 400px;"><source src="${exercise.audio}" type="audio/mpeg"></audio>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
      <div class="card">
        <h3 style="margin-top:0; color:var(--color-primary);">TASK ONE: Reason for changing</h3>
        <div style="margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.6; padding-bottom: 1rem; border-bottom: 1px dashed var(--color-border);">
          ${renderOptions(exercise.optionsTask1)}
        </div>
        ${exercise.questions.map(q => `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span>Speaker ${q.speaker} (Q${q.t1_id.split('_q')[1]}):</span>
            ${renderSelect(q.t1_id, exercise.optionsTask1)}
          </div>
        `).join('')}
      </div>

      <div class="card">
        <h3 style="margin-top:0; color:var(--color-primary);">TASK TWO: Feeling about new job</h3>
        <div style="margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.6; padding-bottom: 1rem; border-bottom: 1px dashed var(--color-border);">
          ${renderOptions(exercise.optionsTask2)}
        </div>
        ${exercise.questions.map(q => `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span>Speaker ${q.speaker} (Q${q.t2_id.split('_q')[1]}):</span>
            ${renderSelect(q.t2_id, exercise.optionsTask2)}
          </div>
        `).join('')}
      </div>
    </div>

    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button><button class="btn btn-primary" id="btn-check">Check Answers</button>
    </div>`;

  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => {
    exercise.questions.forEach(q => {
      answers[q.t1_id] = document.getElementById(q.t1_id).value;
      answers[q.t2_id] = document.getElementById(q.t2_id).value;
    });
    finishQuiz(exercises);
  });
}

async function finishQuiz(exercises) {
  let correct = 0;
  exercise.questions.forEach(q => {
    if (answers[q.t1_id] === q.t1_ans) correct++;
    if (answers[q.t2_id] === q.t2_ans) correct++;
  });
  const total = exercise.questions.length * 2;
  const pct = Math.round((correct / total) * 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  try { await saveResult({ exam: _skill, part: parseInt(_part.replace('part', '')), exerciseId: exercise.title, score: pct }); } catch(e) {}

  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header"><h1 class="page-title">Results</h1></div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-label">Correct</div><div class="stat-value">${correct} / ${total}</div></div>
      <div class="stat-card"><div class="stat-label">Score</div><div class="stat-value" style="color:${color}">${pct}%</div></div>
    </div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem">
      <button class="btn btn-primary" id="btn-review">Check answers</button><button class="btn" id="btn-repeat">Repeat</button><button class="btn" id="btn-destreza">← Back</button>
    </div>`;

  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));
  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

function showReview(exercises) {
  const c = document.getElementById('ejercicio-content');
  let reviewHtml = `<div class="page-header"><h1 class="page-title">Review</h1></div><button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Return</button>`;
  
  exercise.questions.forEach(q => {
    const ok1 = answers[q.t1_id] === q.t1_ans;
    const ok2 = answers[q.t2_id] === q.t2_ans;
    
    reviewHtml += `
      <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${(ok1 && ok2) ? '#22c55e' : (ok1 || ok2) ? '#f59e0b' : '#ef4444'}">
        <h4 style="margin-top:0;">Speaker ${q.speaker}</h4>
        
        <div style="margin-bottom: 1rem;">
          <strong>Task 1:</strong> ${ok1 ? '✅' : '❌'} Your answer: ${answers[q.t1_id] || '-'} | Correct: <span style="color:#22c55e;font-weight:bold">${q.t1_ans}</span>
          <br><span style="font-size:0.85rem;color:var(--color-text-muted)">${q.exp1}</span>
        </div>
        
        <div>
          <strong>Task 2:</strong> ${ok2 ? '✅' : '❌'} Your answer: ${answers[q.t2_id] || '-'} | Correct: <span style="color:#22c55e;font-weight:bold">${q.t2_ans}</span>
          <br><span style="font-size:0.85rem;color:var(--color-text-muted)">${q.exp2}</span>
        </div>
      </div>`;
  });

  c.innerHTML = reviewHtml;
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz(exercises));
}