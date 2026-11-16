// ════════════════════════════════════════════════════════════
// MARCAS SOBRE EL TEXTO DEL ALUMNO
// La profesora selecciona un trozo del texto y lo marca en rojo (error)
// o en verde (bien hecho), con tipo de error, corrección y nota.
// Una marca = { start, end, type, category, correction, note }
// start/end son posiciones dentro del texto original (no cambia nunca).
// ════════════════════════════════════════════════════════════
import { escapeHtml } from '../ui.js';

export const CATEGORIES = {
  grammar:     'Gramática',
  vocabulary:  'Vocabulario',
  spelling:    'Ortografía',
  punctuation: 'Puntuación',
  wordorder:   'Orden de palabras',
  register:    'Registro / estilo',
  linking:     'Conectores',
  other:       'Otro',
};

const TYPE_LABEL = { error: 'Error', good: 'Bien hecho' };

// Ordenar y quitar solapes (por si acaso)
export function normalize(annotations, contentLength) {
  const sorted = (annotations || [])
    .filter(a => Number.isInteger(a.start) && Number.isInteger(a.end) && a.start < a.end && a.end <= contentLength)
    .sort((a, b) => a.start - b.start);
  const out = [];
  for (const a of sorted) if (!out.length || a.start >= out[out.length - 1].end) out.push(a);
  return out;
}

function tooltip(a) {
  const parts = [TYPE_LABEL[a.type] || ''];
  if (a.category) parts.push(CATEGORIES[a.category] || a.category);
  if (a.correction) parts.push(`→ ${a.correction}`);
  if (a.note) parts.push(a.note);
  return parts.filter(Boolean).join(' · ');
}

// Texto con las marcas pintadas. El número va en CSS (::after) para que
// no cuente como texto y las posiciones de la selección sigan cuadrando.
export function annotatedHtml(content, annotations) {
  const anns = normalize(annotations, content.length);
  let html = '', pos = 0;
  anns.forEach((a, i) => {
    html += escapeHtml(content.slice(pos, a.start));
    html += `<mark class="ann ann-${a.type === 'good' ? 'good' : 'error'}" data-i="${i}" data-n="${i + 1}" title="${escapeHtml(tooltip(a))}">`
          + escapeHtml(content.slice(a.start, a.end)) + '</mark>';
    pos = a.end;
  });
  return html + escapeHtml(content.slice(pos));
}

// Lista numerada de marcas debajo del texto
export function annotationListHtml(content, annotations, { editable = false } = {}) {
  const anns = normalize(annotations, content.length);
  if (!anns.length) {
    return editable
      ? '<p class="ann-empty">Selecciona con el ratón un trozo del texto para marcarlo en rojo (error) o verde (bien hecho).</p>'
      : '';
  }
  const errors = anns.filter(a => a.type !== 'good').length;
  const good   = anns.length - errors;
  return `
    <div class="ann-summary">
      <span><span class="ann-dot ann-dot-error"></span>${errors} ${errors === 1 ? 'error' : 'errores'}</span>
      <span><span class="ann-dot ann-dot-good"></span>${good} ${good === 1 ? 'acierto destacado' : 'aciertos destacados'}</span>
    </div>
    <ol class="ann-list">
      ${anns.map((a, i) => `
        <li class="ann-item ann-item-${a.type === 'good' ? 'good' : 'error'}" data-i="${i}">
          <span class="ann-num">${i + 1}</span>
          <div class="ann-body">
            <div>
              <span class="ann-quote">${escapeHtml(content.slice(a.start, a.end))}</span>
              ${a.correction ? ` <span class="ann-arrow">→</span> <strong class="ann-fix">${escapeHtml(a.correction)}</strong>` : ''}
              ${a.category ? ` <span class="ann-cat">${escapeHtml(CATEGORIES[a.category] || a.category)}</span>` : ''}
            </div>
            ${a.note ? `<div class="ann-note">${escapeHtml(a.note)}</div>` : ''}
          </div>
          ${editable ? `<button type="button" class="btn btn-ghost btn-sm" data-edit="${i}">Editar</button>` : ''}
        </li>`).join('')}
    </ol>`;
}

// Al pulsar una marca del texto, resaltar su línea de la lista
export function linkMarksToList(textEl, listEl) {
  textEl.addEventListener('click', (e) => {
    const mark = e.target.closest('mark.ann');
    if (!mark) return;
    const item = listEl.querySelector(`.ann-item[data-i="${mark.dataset.i}"]`);
    if (!item) return;
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    item.classList.remove('flash'); void item.offsetWidth; item.classList.add('flash');
  });
}

// ════════════════════════════════════════════════════════════
// EDITOR (profesora)
// ════════════════════════════════════════════════════════════
export function createAnnotator({ textEl, listEl, wrapEl, content, initial, onChange }) {
  let anns = normalize(initial, content.length);

  // Ventanita para crear/editar una marca
  const pop = document.createElement('div');
  pop.className = 'ann-pop';
  pop.hidden = true;
  pop.innerHTML = `
    <div class="ann-pop-quote"></div>
    <div class="ann-type-toggle" role="group" aria-label="Tipo de marca">
      <button type="button" data-type="error">🔴 Error</button>
      <button type="button" data-type="good">🟢 Bien hecho</button>
    </div>
    <label class="ann-field ann-only-error">Tipo de error
      <select class="form-select" name="category">
        <option value="">—</option>
        ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
      </select>
    </label>
    <label class="ann-field ann-only-error">Corrección <span class="muted">(opcional)</span>
      <input class="form-input" name="correction" maxlength="500" placeholder="Cómo debería ser">
    </label>
    <label class="ann-field">Nota <span class="muted">(opcional)</span>
      <textarea class="form-textarea" name="note" maxlength="1000" rows="2" placeholder="Explicación para el alumno"></textarea>
    </label>
    <div class="ann-pop-actions">
      <button type="button" class="btn btn-danger btn-sm" data-act="delete">Borrar marca</button>
      <span style="flex:1"></span>
      <button type="button" class="btn btn-ghost btn-sm" data-act="cancel">Cancelar</button>
      <button type="button" class="btn btn-primary btn-sm" data-act="save">Guardar marca</button>
    </div>`;
  wrapEl.appendChild(pop);

  let editing = null; // { index } o { start, end } para una nueva
  let type = 'error';

  const setType = (t) => {
    type = t;
    pop.querySelectorAll('[data-type]').forEach(b => b.classList.toggle('active', b.dataset.type === t));
    pop.querySelectorAll('.ann-only-error').forEach(el => { el.hidden = t !== 'error'; });
  };
  pop.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => setType(b.dataset.type)));

  function render() {
    textEl.innerHTML = annotatedHtml(content, anns);
    listEl.innerHTML = annotationListHtml(content, anns, { editable: true });
  }

  function open(target, rect) {
    editing = target;
    const a = target.index !== undefined ? anns[target.index] : { type: 'error' };
    const { start, end } = target.index !== undefined ? a : target;
    pop.querySelector('.ann-pop-quote').textContent = `«${content.slice(start, end)}»`;
    pop.querySelector('[name=category]').value   = a.category   || '';
    pop.querySelector('[name=correction]').value = a.correction || '';
    pop.querySelector('[name=note]').value       = a.note       || '';
    pop.querySelector('[data-act=delete]').hidden = target.index === undefined;
    setType(a.type || 'error');

    // Colocar la ventanita debajo del trozo seleccionado
    pop.hidden = false;
    const box  = wrapEl.getBoundingClientRect();
    const maxL = Math.max(0, box.width - pop.offsetWidth);
    pop.style.left = `${Math.min(Math.max(0, rect.left - box.left), maxL)}px`;
    pop.style.top  = `${rect.bottom - box.top + 8}px`;
    (type === 'error' ? pop.querySelector('[name=category]') : pop.querySelector('[name=note]')).focus();
  }

  function close() {
    pop.hidden = true;
    editing = null;
  }

  function save() {
    if (!editing) return;
    const value = {
      type,
      category:   type === 'error' ? (pop.querySelector('[name=category]').value || null) : null,
      correction: type === 'error' ? (pop.querySelector('[name=correction]').value.trim() || null) : null,
      note:       pop.querySelector('[name=note]').value.trim() || null,
    };
    if (editing.index !== undefined) {
      anns[editing.index] = { ...anns[editing.index], ...value };
    } else {
      anns = normalize([...anns, { start: editing.start, end: editing.end, ...value }], content.length);
    }
    close(); render(); onChange(anns);
  }

  pop.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'cancel') close();
    if (act === 'save') save();
    if (act === 'delete' && editing?.index !== undefined) {
      anns.splice(editing.index, 1);
      close(); render(); onChange(anns);
    }
  });
  pop.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); save(); }
  });

  // Posición de un punto del DOM dentro del texto original
  const offsetOf = (node, offset) => {
    const r = document.createRange();
    r.setStart(textEl, 0);
    r.setEnd(node, offset);
    return r.toString().length;
  };

  function onSelect() {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!textEl.contains(range.startContainer) || !textEl.contains(range.endContainer)) return;

    let start = offsetOf(range.startContainer, range.startOffset);
    let end   = offsetOf(range.endContainer, range.endOffset);
    while (start < end && /\s/.test(content[start]))   start++;
    while (end > start && /\s/.test(content[end - 1])) end--;
    if (start >= end) return;

    if (anns.some(a => start < a.end && end > a.start)) {
      sel.removeAllRanges();
      flashMessage('Ese trozo ya tiene una marca. Pulsa sobre ella para editarla o borrarla.');
      return;
    }
    const rect = range.getBoundingClientRect();
    sel.removeAllRanges();
    open({ start, end }, rect);
  }

  function flashMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'ann-flash';
    msg.textContent = text;
    wrapEl.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
  }

  textEl.addEventListener('mouseup', () => setTimeout(onSelect, 0));
  textEl.addEventListener('keyup', (e) => { if (e.shiftKey) onSelect(); });

  // Pulsar una marca existente (en el texto o "Editar" en la lista) → editarla
  textEl.addEventListener('click', (e) => {
    const mark = e.target.closest('mark.ann');
    if (mark && window.getSelection().isCollapsed) open({ index: Number(mark.dataset.i) }, mark.getBoundingClientRect());
  });
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-edit]');
    if (!btn) return;
    const i = Number(btn.dataset.edit);
    const mark = textEl.querySelector(`mark.ann[data-i="${i}"]`);
    mark?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    open({ index: i }, (mark || btn).getBoundingClientRect());
  });

  // Cerrar al pulsar fuera
  document.addEventListener('mousedown', (e) => {
    if (!pop.isConnected) return;
    if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('mark.ann')) close();
  });

  render();
  return { get: () => anns };
}
