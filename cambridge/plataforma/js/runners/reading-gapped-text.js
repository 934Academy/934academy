import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {}; // Almacenará { A: "B", B: "A", ... } guardando la LETRA seleccionada
let _skill   = '';
let _part    = '';

export function initReadingGappedText(exercises, skill, part) {
  exercise = null;
  answers  = {};
  _skill   = skill;
  _part    = part;
  renderSelector(exercises);
}

function renderSelector(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 6 — Gapped Text</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">📄</div>
          <div class="skill-name">${ex.title}</div>
          <div class="skill-desc">${ex.text_preview.substring(0, 80)}...</div>
          <div class="skill-arrow">Start →</div>
        </div>
      `).join('')}
    </div>
  `;
  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      exercise = exercises[parseInt(card.dataset.i)];
      answers  = { A: "", B: "", C: "", D: "" }; // Inicializamos los 4 huecos vacíos
      renderExercise(exercises);
    });
  });
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');

  // Clonamos el texto base para no machacar el original
  let textWithDropdowns = exercise.reading_text;
  
  // Lista de letras de opciones disponibles en este ejercicio (A, B, C, D, E, F)
  const optionLetters = exercise.paragraphs.map(p => p.letter).sort();

  // Reemplazamos cada marcador [A], [B], [C], [D] por un selector <select>
  ['A', 'B', 'C', 'D'].forEach(gap => {
    let optionsHtml = `<option value="">--</option>`;
    optionLetters.forEach(letter => {
      const isSelected = answers[gap] === letter ? 'selected' : '';
      optionsHtml += `<option value="${letter}" ${isSelected}>${letter}</option>`;
    });

    const selectHtml = `
      <select class="gap-dropdown" data-gap="${gap}" style="
        padding: 4px 8px;
        border-radius: 4px;
        border: 2px solid var(--color-primary);
        font-weight: bold;
        background-color: var(--color-surface);
        color: var(--color-text);
        cursor: pointer;
        margin: 0 4px;
      ">
        ${optionsHtml}
      </select>
    `;
    
    textWithDropdowns = textWithDropdowns.replace(`[${gap}]`, selectHtml);
  });

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 6 — ${exercise.title}</h1>
      <p class="page-subtitle">Read the text and choose the correct paragraph (A–F) for each gap. <strong>Two paragraphs are extra!</strong></p>
    </div>
    
    <div class="card" style="line-height:1.8; margin-bottom:1.5rem; font-size:1.05rem;">
      ${textWithDropdowns}
    </div>

    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title" style="border-bottom: 2px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1rem;">
        📂 Available Paragraphs (A–F)
      </div>
      <div style="display:flex; flex-direction:column; gap:1rem">
        ${exercise.paragraphs.map(p => `
          <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 0.5rem; border-bottom: 1px dashed var(--color-border);">
            <span style="
              background: var(--color-primary); 
              color: white; 
              font-weight: bold; 
              padding: 2px 8px; 
              border-radius: 4px;
              min-width: 25px;
              text-align: center;
            ">${p.letter}</span>
            <div style="color: var(--color-text); line-height: 1.5;">${p.text}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="display:flex; gap:1rem; flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn" id="btn-clear">Clear Answers</button>
      <button class="btn btn-primary" id="btn-check">Check Results</button>
    </div>
  `;

  // Escuchamos los cambios en los desplegables para actualizar el estado en tiempo real
  c.querySelectorAll('.gap-dropdown').forEach(select => {
    select.addEventListener('change', (e) => {
      const gap = e.target.dataset.gap;
      answers[gap] = e.target.value;
    });
  });

  document.getElementById('btn-clear').addEventListener('click', () => { 
    answers = { A: "", B: "", C: "", D: "" }; 
    renderExercise(exercises); 
  });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => finishQuiz(exercises));
}

async function finishQuiz(exercises) {
  let correct = 0;
  const gaps = ['A', 'B', 'C', 'D'];
  
  gaps.forEach(gap => {
    if (answers[gap] === exercise.answers[gap]) correct++;
  });
  
  const total = gaps.length;
  const pct   = Math.round((correct / total) * 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  try {
    await saveResult({
      exam:       _skill,
      part:       parseInt(_part.replace('part', '')),
      exerciseId: exercise.title,
      score:      pct,
    });
  } catch(e) { console.warn('Error guardando resultado:', e); }

  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Results — ${exercise.title}</h1>
    </div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Correct Gaps</div>
        <div class="stat-value">${correct} / ${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Final Score</div>
        <div class="stat-value" style="color:${color}">${pct}%</div>
      </div>
    </div>
    <div style="display:flex; flex-direction:column; gap:1.25rem; margin-top:1.5rem" id="review-list"></div>
    <div style="display:flex; gap:1rem; margin-top:1.5rem; flex-wrap:wrap">
      <button class="btn" id="btn-repeat">Repeat Exercise</button>
      <button class="btn" id="btn-sel">Choose Another</button>
      <button class="btn" id="btn-destreza">← Back to Reading</button>
    </div>
  `;

  const list = document.getElementById('review-list');
  gaps.forEach(gap => {
    const correctLetter = exercise.answers[gap];
    const userLetter    = answers[gap];
    
    const correctPara = exercise.paragraphs.find(p => p.letter === correctLetter);
    const userPara    = exercise.paragraphs.find(p => p.letter === userLetter);
    
    const isCorrect = userLetter === correctLetter;
    
    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${isCorrect ? '#22c55e' : '#ef4444'}`;
    
    div.innerHTML = `
      <div class="card-title" style="color:${isCorrect ? '#22c55e' : '#ef4444'}; font-weight: bold; margin-bottom: 0.5rem;">
        Gap [${gap}] — ${isCorrect ? '✅ Correct' : '❌ Incorrect'}
      </div>
      <p style="margin: 0.25rem 0;"><strong>Your selection:</strong> ${userLetter ? `<span style="background: var(--color-border); padding: 2px 6px; border-radius:4px;">Paragraph ${userLetter}</span>: ${userPara.text}` : '<em style="color: grey;">No answer selected</em>'}</p>
      <p style="margin: 0.25rem 0;"><strong>Correct Paragraph:</strong> <span style="color:#22c55e; font-weight:600;"><span style="background: #22c55e; color: white; padding: 2px 6px; border-radius:4px;">Paragraph ${correctLetter}</span>: ${correctPara.text}</span></p>
      <div style="border-top:1px solid var(--color-border); padding-top:0.75rem; margin-top:0.75rem; font-size: 0.95rem;">
        <strong>Key Explanation:</strong> ${exercise.explanations[gap]}
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-repeat').addEventListener('click', () => { answers = { A: "", B: "", C: "", D: "" }; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}