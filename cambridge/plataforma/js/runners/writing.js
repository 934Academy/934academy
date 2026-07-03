let _skill = '';
let _part  = '';
let _level = 'B2'; // Guardamos el nivel actual

export function initWriting(prompts, skill, part, level = 'B2') {
  _skill = skill;
  _part  = part;
  _level = level;
  renderTypeSelector(prompts);
}

function renderTypeSelector(prompts) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Writing — ${_level}</h1>
      <p class="page-subtitle">Select the type of text you want to practice</p>
    </div>
    <div class="skill-grid">
      ${prompts.map((type, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">${type.icon}</div>
          <div class="skill-name">${type.type}</div>
          <div class="skill-desc">${type.desc}</div>
          <div class="skill-arrow">${type.prompts.length} prompts →</div>
        </div>
      `).join('')}
    </div>
  `;
  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      renderPromptSelector(prompts, prompts[parseInt(card.dataset.i, 10)]);
    });
  });
}

function renderPromptSelector(allPrompts, type) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${type.icon} ${type.type}</h1>
      <p class="page-subtitle">Choose a prompt to practice</p>
    </div>
    <button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Text Types</button>
    <div class="skill-grid">
      ${type.prompts.map((p, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">${type.icon}</div>
          <div class="skill-name">${p.title}</div>
          <div class="skill-arrow">Practice →</div>
        </div>
      `).join('')}
    </div>
  `;
  document.getElementById('btn-back').addEventListener('click', () => renderTypeSelector(allPrompts));
  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      renderWritingTask(allPrompts, type, type.prompts[parseInt(card.dataset.i, 10)]);
    });
  });
}

function renderWritingTask(allPrompts, type, prompt) {
  // Lógica dinámica para calcular las palabras basándose en el nivel o el prompt
  let minWords = 140;
  let maxWords = 190;
  
  if (_level === 'C1') { minWords = 220; maxWords = 260; }
  else if (_level === 'B1') { minWords = 100; maxWords = 120; }

  // Extraemos automáticamente los números del texto del prompt (ej. "Write 220-260 words")
  const rangeMatch = prompt.task.match(/(\d+)[\s\-–]+(\d+)\s*words/i);
  const exactMatch = prompt.task.match(/about\s*(\d+)\s*words/i) || prompt.task.match(/(\d+)\s*words/i);

  if (rangeMatch) {
    minWords = parseInt(rangeMatch[1], 10);
    maxWords = parseInt(rangeMatch[2], 10);
  } else if (exactMatch) {
    minWords = parseInt(exactMatch[1], 10);
    maxWords = minWords + 30; // Margen superior si solo dan un número
  }

  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${type.icon} ${prompt.title}</h1>
      <p class="page-subtitle">${type.type} — ${minWords}–${maxWords} words</p>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">📋 Prompt</div>
      <p style="white-space:pre-line;line-height:1.8">${prompt.task}</p>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">💡 Tips</div>
      <ul style="padding-left:1.25rem;display:flex;flex-direction:column;gap:.4rem">
        ${prompt.tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">✍️ Your Answer</div>
      <textarea id="writing-input" placeholder="Write your text here (${minWords}–${maxWords} words)..."
        style="width:100%;min-height:220px;padding:1rem;border-radius:8px;
        border:2px solid var(--color-border);background:var(--color-surface);
        color:var(--color-text);font-size:1rem;line-height:1.7;resize:vertical;
        font-family:inherit;box-sizing:border-box"></textarea>
      <div style="margin-top:.5rem;font-size:.85rem;color:var(--color-text-muted)">
        Words: <strong id="word-count">0</strong>
        <span id="wc-status" style="margin-left:.5rem"></span>
      </div>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn" id="btn-back">← Prompts</button>
      <button class="btn" id="btn-clear">Clear Text</button>
      <button class="btn btn-primary" id="btn-rubric">View Grading Rubric</button>
    </div>
    <div id="rubric-panel" style="display:none;margin-top:1.5rem"></div>
  `;

  const textarea  = document.getElementById('writing-input');
  const wcDisplay = document.getElementById('word-count');
  const wcStatus  = document.getElementById('wc-status');

  // Lógica de contador usando las variables dinámicas calculadas arriba
  textarea.addEventListener('input', () => {
    const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    wcDisplay.textContent = words;
    if (words < minWords) {
      wcStatus.textContent = `(${minWords - words} words less than the minimum)`;
      wcStatus.style.color = '#ef4444';
    } else if (words > maxWords) {
      wcStatus.textContent = `(${words - maxWords} words above the maximum)`;
      wcStatus.style.color = '#f59e0b';
    } else {
      wcStatus.textContent = '✓ Within the limit';
      wcStatus.style.color = '#22c55e';
    }
  });

  document.getElementById('btn-back').addEventListener('click', () => renderPromptSelector(allPrompts, type));
  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Clear all text?')) {
      textarea.value = '';
      wcDisplay.textContent = '0';
      wcStatus.textContent = '';
    }
  });

  document.getElementById('btn-rubric').addEventListener('click', () => {
    const panel = document.getElementById('rubric-panel');
    if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
    panel.style.display = 'block';
    panel.innerHTML = `
      <div class="card">
        <div class="card-title">📐 Grading Rubric ${_level}</div>
        <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1rem">
          ${[
            { label: 'Content', desc: 'Have you answered the prompt? Do you cover all the requested points? Is it relevant and well-developed?' },
            { label: 'Communicative Achievement', desc: 'Is the register appropriate (formal/informal)? Does it impact the reader? Is it suitable for the type of text?' },
            { label: 'Organisation', desc: 'Is there an introduction, development, and conclusion? Do you use connectors? Is the structure clear and logical?' },
            { label: 'Language', desc: 'Are you using varied and precise vocabulary? Is the grammar correct? Is there diversity in the structures?' },
          ].map(r => `
            <div style="padding:.75rem;background:var(--color-surface);border-radius:8px;
              border:1px solid var(--color-border)">
              <strong style="color:var(--color-primary)">${r.label}</strong>
              <p style="margin:.25rem 0 0;font-size:.9rem;color:var(--color-text-muted)">${r.desc}</p>
            </div>
          `).join('')}
        </div>
        <p style="margin-top:1rem;font-size:.85rem;color:var(--color-text-muted)">
          Each criterion is scored from 0 to 5. The maximum grade is 20 points.
        </p>
      </div>
    `;
  });
}