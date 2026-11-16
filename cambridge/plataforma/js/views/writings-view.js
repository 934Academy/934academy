// ════════════════════════════════════════════════════════════
// VISTAS DE WRITINGS
//   · Alumno:    "Mis writings" (lista) + detalle con el feedback
//   · Profesora: "Corregir writings" (lista con filtros) + detalle con rúbrica
// ════════════════════════════════════════════════════════════
import { listWritings, getWriting, reviewWriting, countPendingWritings, totalScore, RUBRIC } from '../writings.js';
import { getAllProfiles } from '../auth.js';
import { getGroups } from '../groups.js';
import { navigate } from '../router.js';
import { showToast, escapeHtml, formatDate } from '../ui.js';

const isStaff = (user) => user.role === 'teacher' || user.role === 'admin';

function statusBadge(w) {
  return w.status === 'reviewed'
    ? '<span class="badge badge-reviewed">Corregido</span>'
    : '<span class="badge badge-pending">Pendiente</span>';
}

function scoreCell(w) {
  const total = totalScore(w);
  return total === null ? '<span style="color:var(--color-text-faint)">—</span>' : `<strong>${total}</strong>/20`;
}

const loading = '<p style="color:var(--color-text-muted)">Cargando...</p>';
const errorBox = (err) => `<div class="alert alert-error visible">${escapeHtml(err.message)}</div>`;

// Filas clicables → detalle (delegado: las tablas se repintan)
for (const id of ['mis-writings-content', 'writings-content']) {
  document.getElementById(id)?.addEventListener('click', (e) => {
    const row = e.target.closest('tr[data-writing-id]');
    if (row) navigate('writing', { id: row.dataset.writingId });
  });
}

// ─────────────────────────────────────────────
// Contador de pendientes en el menú (profesora/admin)
// ─────────────────────────────────────────────
export async function refreshPendingBadge() {
  const badge = document.getElementById('pending-badge');
  if (!badge) return;
  const n = await countPendingWritings();
  badge.textContent = n;
  badge.hidden = n === 0;
}

// ─────────────────────────────────────────────
// ALUMNO: MIS WRITINGS
// ─────────────────────────────────────────────
export async function renderMyWritings() {
  const content = document.getElementById('mis-writings-content');
  content.innerHTML = loading;

  try {
    const writings = await listWritings();
    if (writings.length === 0) {
      content.innerHTML = `
        <div class="card empty-state">
          Todavía no has enviado ningún writing.<br><br>
          <button class="btn btn-primary" onclick="navigate('destreza', {skill:'writing'})">Ir a Writing →</button>
        </div>`;
      return;
    }

    content.innerHTML = `
      <div class="card" style="padding:0;overflow-x:auto">
        <table class="table">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Tarea</th><th>Palabras</th><th>Estado</th><th>Nota</th></tr></thead>
          <tbody>
            ${writings.map(w => `
              <tr class="row-link" data-writing-id="${escapeHtml(w.id)}">
                <td style="color:var(--color-text-muted)">${formatDate(w.submitted_at)}</td>
                <td>${escapeHtml(w.task_type)}</td>
                <td>${escapeHtml(w.prompt_title)}</td>
                <td>${w.word_count}</td>
                <td>${statusBadge(w)}</td>
                <td>${scoreCell(w)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    content.innerHTML = errorBox(err);
  }
}

// ─────────────────────────────────────────────
// PROFESORA / ADMIN: CORREGIR WRITINGS
// ─────────────────────────────────────────────
const statusFilter = document.getElementById('writings-filter-status');
const groupFilter  = document.getElementById('writings-filter-group');
statusFilter?.addEventListener('change', () => renderWritingsList());
groupFilter?.addEventListener('change',  () => renderWritingsList());

export async function renderWritingsList(params = {}) {
  const content = document.getElementById('writings-content');
  content.innerHTML = loading;

  try {
    const [profiles, groups] = await Promise.all([getAllProfiles(), getGroups()]);
    const byId      = new Map(profiles.map(p => [p.id, p]));
    const groupById = new Map(groups.map(g => [g.id, g]));

    // Rellenar el selector de grupos conservando la selección
    const selected = params.groupId ?? groupFilter.value;
    groupFilter.innerHTML = `<option value="">Todos los grupos</option>` +
      groups.map(g => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.name)}</option>`).join('');
    groupFilter.value = groupById.has(selected) ? selected : '';

    const groupId    = groupFilter.value;
    const studentIds = groupId ? profiles.filter(p => p.group_id === groupId).map(p => p.id) : undefined;
    const writings   = (studentIds && studentIds.length === 0)
      ? []
      : await listWritings({ status: statusFilter.value || undefined, studentIds });

    if (writings.length === 0) {
      const msg = statusFilter.value === 'submitted' ? 'No hay writings pendientes de corregir 🎉' : 'No hay writings.';
      content.innerHTML = `<div class="card empty-state">${msg}</div>`;
      return;
    }

    content.innerHTML = `
      <div class="card" style="padding:0;overflow-x:auto">
        <table class="table">
          <thead><tr><th>Enviado</th><th>Alumno</th><th>Grupo</th><th>Nivel</th><th>Tarea</th><th>Palabras</th><th>Estado</th><th>Nota</th></tr></thead>
          <tbody>
            ${writings.map(w => {
              const student = byId.get(w.student_id);
              const group   = groupById.get(student?.group_id);
              return `
                <tr class="row-link" data-writing-id="${escapeHtml(w.id)}">
                  <td style="color:var(--color-text-muted)">${formatDate(w.submitted_at)}</td>
                  <td><strong>${escapeHtml(student?.full_name || '—')}</strong></td>
                  <td>${escapeHtml(group?.name || '—')}</td>
                  <td><span class="badge badge-level">${escapeHtml(w.level)}</span></td>
                  <td>${escapeHtml(w.task_type)} · ${escapeHtml(w.prompt_title)}</td>
                  <td>${w.word_count}</td>
                  <td>${statusBadge(w)}</td>
                  <td>${scoreCell(w)}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    content.innerHTML = errorBox(err);
  }
}

// ─────────────────────────────────────────────
// DETALLE DE UN WRITING
// ─────────────────────────────────────────────
export async function renderWritingDetail(params, currentUser) {
  const content = document.getElementById('writing-detail-content');
  content.innerHTML = loading;

  const staff    = isStaff(currentUser);
  const backPage = staff ? 'writings' : 'mis-writings';

  try {
    const w = await getWriting(params.id);
    // Nombres del alumno y de quien corrigió (la RLS deja ver solo los permitidos)
    const profiles = await getAllProfiles();
    const byId     = new Map(profiles.map(p => [p.id, p]));
    const student  = byId.get(w.student_id);
    const reviewer = byId.get(w.reviewed_by);

    content.innerHTML = `
      <button class="btn btn-ghost" id="writing-back" style="margin-bottom:var(--space-5)">← Volver</button>
      <div class="page-header">
        <h1 class="page-title">${escapeHtml(w.prompt_title)}</h1>
        <p class="page-subtitle">${escapeHtml(w.task_type)} · ${escapeHtml(w.level)}</p>
      </div>
      <div class="writing-meta">
        ${staff ? `<span>👤 <strong>${escapeHtml(student?.full_name || '—')}</strong></span>` : ''}
        <span>📅 Enviado el ${formatDate(w.submitted_at)}</span>
        <span>🔢 ${w.word_count} palabras</span>
        <span>${statusBadge(w)}</span>
      </div>

      <div class="writing-layout">
        <div>
          <div class="card">
            <div class="card-title">✍️ ${staff ? 'Texto del alumno' : 'Tu texto'}</div>
            <div class="writing-text">${escapeHtml(w.content)}</div>
          </div>
          <details class="card">
            <summary class="card-title" style="cursor:pointer;margin:0">📋 Enunciado</summary>
            <div class="prompt-text" style="margin-top:var(--space-4)">${escapeHtml(w.prompt_text)}</div>
          </details>
        </div>
        <div>
          ${staff ? reviewFormHtml(w) : feedbackHtml(w, reviewer)}
        </div>
      </div>`;

    document.getElementById('writing-back').addEventListener('click', () => navigate(backPage));
    if (staff) bindReviewForm(w);
  } catch (err) {
    content.innerHTML = errorBox(err);
  }
}

// Alumno: ver la corrección
function feedbackHtml(w, reviewer) {
  if (w.status !== 'reviewed') {
    return `
      <div class="card empty-state">
        ⏳ Tu profesora todavía no ha corregido este writing.<br>
        Aquí aparecerá su feedback cuando lo haga.
      </div>`;
  }
  const total = totalScore(w);
  return `
    <div class="card">
      <div class="card-title">💬 Feedback${reviewer ? ` de ${escapeHtml(reviewer.full_name)}` : ''}</div>
      <div class="feedback-box">${escapeHtml(w.feedback)}</div>
      <p style="font-size:var(--text-xs);color:var(--color-text-faint);margin-top:var(--space-2)">
        Corregido el ${formatDate(w.reviewed_at)}
      </p>
    </div>
    ${total === null ? '' : `
    <div class="card">
      <div class="card-title">📐 Nota</div>
      ${RUBRIC.map(r => `
        <div class="rubric-row">
          <div><div class="rubric-label">${r.label}</div><div class="rubric-desc">${r.desc}</div></div>
          <span class="rubric-score">${w[r.key] ?? '—'}/5</span>
        </div>`).join('')}
      <div class="rubric-total"><span>Total</span><strong>${total}/20</strong></div>
    </div>`}`;
}

// Profesora: formulario de corrección
function reviewFormHtml(w) {
  const options = (value) => ['', 0, 1, 2, 3, 4, 5].map(n =>
    `<option value="${n}" ${value !== null && value !== undefined && String(value) === String(n) ? 'selected' : ''}>${n === '' ? '–' : n}</option>`
  ).join('');

  return `
    <form class="card" id="review-form">
      <div class="card-title">📐 Rúbrica (0–5)</div>
      ${RUBRIC.map(r => `
        <div class="rubric-row">
          <div><div class="rubric-label">${r.label}</div><div class="rubric-desc">${r.desc}</div></div>
          <select class="form-select" name="${r.key}" aria-label="${r.label}">${options(w[r.key])}</select>
        </div>`).join('')}
      <div class="rubric-total"><span>Total</span><strong id="review-total">–/20</strong></div>

      <div class="form-field" style="margin-top:var(--space-6)">
        <label class="form-label" for="review-feedback">💬 Feedback para el alumno</label>
        <textarea class="form-textarea" id="review-feedback" name="feedback" required
          placeholder="Strengths, things to improve, corrections…">${escapeHtml(w.feedback || '')}</textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-full" style="margin-top:var(--space-4)">
        ${w.status === 'reviewed' ? 'Actualizar corrección' : 'Guardar corrección'}
      </button>
      ${w.reviewed_at ? `<p style="font-size:var(--text-xs);color:var(--color-text-faint);margin-top:var(--space-2)">Última corrección: ${formatDate(w.reviewed_at)}</p>` : ''}
    </form>`;
}

function bindReviewForm(w) {
  const form    = document.getElementById('review-form');
  const totalEl = document.getElementById('review-total');

  const readScores = () => Object.fromEntries(
    RUBRIC.map(r => {
      const v = form.elements[r.key].value;
      return [r.key, v === '' ? null : Number(v)];
    })
  );
  const updateTotal = () => {
    const t = totalScore(readScores());
    totalEl.textContent = t === null ? '–/20' : `${t}/20`;
  };
  form.addEventListener('change', updateTotal);
  updateTotal();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await reviewWriting(w.id, { feedback: form.elements.feedback.value, scores: readScores() });
      showToast('Corrección guardada ✓');
      refreshPendingBadge();
      navigate('writings');
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
    }
  });
}
