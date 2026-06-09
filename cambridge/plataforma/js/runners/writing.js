let _skill = '';
let _part  = '';

export function initWriting(prompts, skill, part) {
  _skill = skill;
  _part  = part;
  renderTypeSelector(prompts);
}

function renderTypeSelector(prompts) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Writing — B2 First</h1>
      <p class="page-subtitle">Selecciona el tipo de texto que quieres practicar</p>
    </div>
    <div class="skill-grid">
      ${prompts.map((type, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">${type.icon}</div>
          <div class="skill-name">${type.type}</div>
          <div class="skill-desc">${type.desc}</div>
          <div class="skill-arrow">${type.prompts.length} enunciados →</div>
        </div>
      `).join('')}
    </div>
  `;
  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      renderPromptSelector(prompts, prompts[parseInt(card.dataset.i)]);
    });
  });
}

function renderPromptSelector(allPrompts, type) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${type.icon} ${type.type}</h1>
      <p class="page-subtitle">Elige un enunciado para practicar</p>
    </div>
    <button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Tipos de texto</button>
    <div class="skill-grid">
      ${type.prompts.map((p, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">${type.icon}</div>
          <div class="skill-name">${p.title}</div>
          <div class="skill-arrow">Practicar →</div>
        </div>
      `).join('')}
    </div>
  `;
  document.getElementById('btn-back').addEventListener('click', () => renderTypeSelector(allPrompts));
  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      renderWritingTask(allPrompts, type, type.prompts[parseInt(card.dataset.i)]);
    });
  });
}

function renderWritingTask(allPrompts, type, prompt) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${type.icon} ${prompt.title}</h1>
      <p class="page-subtitle">${type.type} — 140–190 palabras</p>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">📋 Enunciado</div>
      <p style="white-space:pre-line;line-height:1.8">${prompt.task}</p>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">💡 Consejos</div>
      <ul style="padding-left:1.25rem;display:flex;flex-direction:column;gap:.4rem">
        ${prompt.tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">✍️ Tu respuesta</div>
      <textarea id="writing-input" placeholder="Escribe aquí tu texto (140–190 palabras)..."
        style="width:100%;min-height:220px;padding:1rem;border-radius:8px;
        border:2px solid var(--color-border);background:var(--color-surface);
        color:var(--color-text);font-size:1rem;line-height:1.7;resize:vertical;
        font-family:inherit;box-sizing:border-box"></textarea>
      <div style="margin-top:.5rem;font-size:.85rem;color:var(--color-text-muted)">
        Palabras: <strong id="word-count">0</strong>
        <span id="wc-status" style="margin-left:.5rem"></span>
      </div>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn" id="btn-back">← Enunciados</button>
      <button class="btn" id="btn-clear">Borrar texto</button>
      <button class="btn btn-primary" id="btn-rubric">Ver rúbrica de corrección</button>
    </div>
    <div id="rubric-panel" style="display:none;margin-top:1.5rem"></div>
  `;

  const textarea  = document.getElementById('writing-input');
  const wcDisplay = document.getElementById('word-count');
  const wcStatus  = document.getElementById('wc-status');

  textarea.addEventListener('input', () => {
    const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    wcDisplay.textContent = words;
    if (words < 140) {
      wcStatus.textContent = `(${140 - words} palabras menos del mínimo)`;
      wcStatus.style.color = '#ef4444';
    } else if (words > 190) {
      wcStatus.textContent = `(${words - 190} palabras por encima del máximo)`;
      wcStatus.style.color = '#f59e0b';
    } else {
      wcStatus.textContent = '✓ Dentro del límite';
      wcStatus.style.color = '#22c55e';
    }
  });

  document.getElementById('btn-back').addEventListener('click', () => renderPromptSelector(allPrompts, type));
  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('¿Borrar todo el texto?')) {
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
        <div class="card-title">📐 Rúbrica de corrección B2 First</div>
        <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1rem">
          ${[
            { label: 'Content', desc: '¿Has respondido al enunciado? ¿Cubres todos los puntos pedidos? ¿Es relevante y desarrollado?' },
            { label: 'Communicative Achievement', desc: '¿El registro es adecuado (formal/informal)? ¿Impacta al lector? ¿Es apropiado para el tipo de texto?' },
            { label: 'Organisation', desc: '¿Hay introducción, desarrollo y conclusión? ¿Usas conectores? ¿La estructura es clara y lógica?' },
            { label: 'Language', desc: '¿Usas vocabulario variado y preciso? ¿La gramática es correcta? ¿Hay variedad en las estructuras?' },
          ].map(r => `
            <div style="padding:.75rem;background:var(--color-surface);border-radius:8px;
              border:1px solid var(--color-border)">
              <strong style="color:var(--color-primary)">${r.label}</strong>
              <p style="margin:.25rem 0 0;font-size:.9rem;color:var(--color-text-muted)">${r.desc}</p>
            </div>
          `).join('')}
        </div>
        <p style="margin-top:1rem;font-size:.85rem;color:var(--color-text-muted)">
          Cada criterio se puntúa de 0 a 5. La nota máxima es 20 puntos.
        </p>
      </div>
    `;
  });
}