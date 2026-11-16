// ════════════════════════════════════════════════════════════
// INICIO DE TEACHERS Y ADMIN: resumen de sus clases
// (la RLS hace que cada teacher vea solo sus grupos y sus alumnos)
// ════════════════════════════════════════════════════════════
import { getAllProfiles, getResultsForUsers } from '../auth.js';
import { getGroups } from '../groups.js';
import { listWritings } from '../writings.js';
import { summarize, since, scoreClass, avgOf } from '../progress.js';
import { navigate } from '../router.js';
import { escapeHtml, formatDate } from '../ui.js';

const INACTIVE_DAYS = 7;
const daysSince = (date) => date ? (Date.now() - new Date(date).getTime()) / 86400000 : Infinity;

const container = document.getElementById('staff-home');

// Clics: tarjetas y filas con data-go → navegar
container?.addEventListener('click', (e) => {
  const el = e.target.closest('[data-go]');
  if (!el) return;
  e.preventDefault();
  navigate(el.dataset.go, JSON.parse(el.dataset.params || '{}'));
});

const go = (page, params = {}) => `data-go="${page}" data-params='${escapeHtml(JSON.stringify(params))}'`;

export async function renderStaffHome(currentUser) {
  if (!container) return;
  container.innerHTML = '<p style="color:var(--color-text-muted)">Cargando tus clases...</p>';

  try {
    const [profiles, groups] = await Promise.all([getAllProfiles(), getGroups()]);
    const isAdmin  = currentUser.role === 'admin';
    const myGroups = isAdmin ? groups : groups.filter(g => g.teacher_id === currentUser.id);
    const groupIds = new Set(myGroups.map(g => g.id));
    const students = profiles.filter(p => p.role === 'student' && (isAdmin || groupIds.has(p.group_id)));
    const byId     = new Map(profiles.map(p => [p.id, p]));

    if (!myGroups.length && !students.length) {
      container.innerHTML = `
        <div class="card empty-state" style="margin-bottom:var(--space-8)">
          Todavía no tienes grupos asignados.<br>
          ${isAdmin ? 'Crea grupos en <strong>Grupos</strong> y asígnales una teacher.' : 'Pide a la administración que te asigne tus grupos.'}
        </div>`;
      return;
    }

    const ids = students.map(s => s.id);
    const [results, pending] = await Promise.all([
      getResultsForUsers(ids),
      ids.length ? listWritings({ status: 'submitted', studentIds: ids }) : [],
    ]);
    const last7    = since(results, INACTIVE_DAYS);
    const last30   = since(results, 30);
    const active   = new Set(last7.map(r => r.user_id));
    const inactive = students
      .filter(s => !active.has(s.id) && daysSince(s.last_seen_at) > INACTIVE_DAYS)
      .sort((a, b) => daysSince(b.last_seen_at) - daysSince(a.last_seen_at));
    const avg30    = summarize(last30).avg;

    const groupRows = myGroups.map(g => {
      const gs  = students.filter(s => s.group_id === g.id);
      const gid = new Set(gs.map(s => s.id));
      return {
        g, count: gs.length,
        active: gs.filter(s => active.has(s.id)).length,
        avg: avgOf(gs.map(s => summarize(last30.filter(r => r.user_id === s.id)).avg)),
        pending: pending.filter(w => gid.has(w.student_id)).length,
      };
    });

    container.innerHTML = `
      <div class="stat-grid" style="margin-bottom:var(--space-6)">
        <div class="stat-card stat-link" ${go('writings')}>
          <div class="stat-label">Writings por corregir</div>
          <div class="stat-value ${pending.length ? 'score-mid-text' : ''}">${pending.length}</div>
          <div class="stat-sub">${pending.length ? 'Corregir →' : 'Todo al día 🎉'}</div>
        </div>
        <div class="stat-card stat-link" ${go('grupos')}>
          <div class="stat-label">Alumnos</div>
          <div class="stat-value">${students.length}</div>
          <div class="stat-sub">en ${myGroups.length} ${myGroups.length === 1 ? 'grupo' : 'grupos'}</div>
        </div>
        <div class="stat-card stat-link" ${go('progreso')}>
          <div class="stat-label">Han practicado esta semana</div>
          <div class="stat-value">${active.size}<small>/${students.length}</small></div>
          <div class="stat-sub">${last7.length} ejercicios en ${INACTIVE_DAYS} días</div>
        </div>
        <div class="stat-card stat-link" ${go('progreso', { period: 30 })}>
          <div class="stat-label">Media de aciertos</div>
          <div class="stat-value ${scoreClass(avg30)}-text">${avg30 ?? '—'}${avg30 !== null ? '%' : ''}</div>
          <div class="stat-sub">últimos 30 días</div>
        </div>
      </div>

      ${inactive.length ? `
        <div class="insight insight-warn">
          ⚠️ <strong>${inactive.length} ${inactive.length === 1 ? 'alumno lleva' : 'alumnos llevan'} más de ${INACTIVE_DAYS} días sin entrar ni practicar:</strong>
          ${inactive.slice(0, 6).map(s => `<a href="#" class="inline-link" ${go('alumno', { id: s.id, from: 'dashboard' })}>${escapeHtml(s.full_name)}</a>`).join(', ')}${inactive.length > 6 ? ` y ${inactive.length - 6} más` : ''}.
        </div>` : ''}

      <div class="home-columns">
        <div>
          <div class="section-title">Tus grupos</div>
          ${groupRows.length ? `
            <div class="card" style="padding:0;overflow-x:auto">
              <table class="table">
                <thead><tr><th>Grupo</th><th class="num">Alumnos</th><th class="num">Activos 7d</th><th class="num">Media 30d</th><th class="num">Writings</th></tr></thead>
                <tbody>
                  ${groupRows.map(r => `
                    <tr class="row-link" ${go('progreso', { groupId: r.g.id })}>
                      <td><strong>${escapeHtml(r.g.name)}</strong> ${r.g.level ? `<span class="badge badge-level">${escapeHtml(r.g.level)}</span>` : ''}
                        ${isAdmin ? `<div class="group-username">${escapeHtml(byId.get(r.g.teacher_id)?.full_name || 'Sin teacher')}</div>` : ''}</td>
                      <td class="num">${r.count}</td>
                      <td class="num">${r.active}/${r.count}</td>
                      <td class="num">${r.avg === null ? '<span class="muted">—</span>' : `<span class="score-pill ${scoreClass(r.avg)}">${r.avg}%</span>`}</td>
                      <td class="num">${r.pending ? `<span class="badge badge-pending">${r.pending} por corregir</span>` : '<span class="muted">—</span>'}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>` : '<div class="card empty-state">Sin grupos.</div>'}
        </div>
        <div>
          <div class="section-title">Writings recibidos</div>
          ${pending.length ? `
            <div class="card" style="padding:0">
              <table class="table">
                <tbody>
                  ${pending.slice(0, 6).map(w => `
                    <tr class="row-link" ${go('writing', { id: w.id })}>
                      <td><strong>${escapeHtml(byId.get(w.student_id)?.full_name || '—')}</strong>
                        <div class="group-username">${escapeHtml(w.task_type)} · ${escapeHtml(w.prompt_title)}</div></td>
                      <td class="num muted">${formatDate(w.submitted_at)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
            ${pending.length > 6 ? `<p class="table-help"><a href="#" class="inline-link" ${go('writings')}>Ver los ${pending.length} pendientes →</a></p>` : ''}`
            : '<div class="card empty-state">No tienes writings por corregir 🎉</div>'}
        </div>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error visible" style="margin-bottom:var(--space-6)">
      No se ha podido cargar el resumen de tus clases: ${escapeHtml(err.message)}</div>`;
  }
}
