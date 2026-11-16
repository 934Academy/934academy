// ════════════════════════════════════════════════════════════
// PROGRESO
//   · Profesora/admin: "Progreso" → tabla del grupo (% por destreza)
//                      y ficha de cada alumno
//   · Alumno: "Mis resultados" muestra su propia ficha
// ════════════════════════════════════════════════════════════
import { getAllProfiles, getResultsForUsers } from '../auth.js';
import { getGroups } from '../groups.js';
import { listWritings, totalScore } from '../writings.js';
import { summarize, partsRanking, writingSummary, since, scoreClass, avgOf } from '../progress.js';
import { SKILL_NAMES, SKILL_ORDER, partLabel } from '../exam-structure.js';
import { navigate } from '../router.js';
import { escapeHtml, formatDate, lastSeenBadge } from '../ui.js';

const EXERCISE_SKILLS = SKILL_ORDER.filter(s => s !== 'writing');
const loading  = '<p style="color:var(--color-text-muted)">Cargando...</p>';
const errorBox = (err) => `<div class="alert alert-error visible">${escapeHtml(err.message)}</div>`;

// B1 no tiene Use of English
const skillsForLevel = (level) => EXERCISE_SKILLS.filter(s => !(level === 'B1' && s === 'use-of-english'));

function pill(pct, extra = '') {
  if (pct === null || pct === undefined) return '<span class="score-pill score-none">—</span>';
  return `<span class="score-pill ${scoreClass(pct)}">${pct}%</span>${extra}`;
}

function trendHtml(t) {
  if (t === null || t === undefined) return '';
  if (Math.abs(t) < 3) return '<span class="trend trend-flat" title="Estable respecto a los intentos anteriores">→</span>';
  return t > 0
    ? `<span class="trend trend-up" title="Mejora respecto a los intentos anteriores">↑ ${t}</span>`
    : `<span class="trend trend-down" title="Empeora respecto a los intentos anteriores">↓ ${Math.abs(t)}</span>`;
}

// ════════════════════════════════════════════════════════════
// PROGRESO DEL GRUPO (profesora / admin)
// ════════════════════════════════════════════════════════════
const groupSelect  = document.getElementById('progreso-group');
const periodSelect = document.getElementById('progreso-period');
groupSelect?.addEventListener('change',  () => renderProgress());
periodSelect?.addEventListener('change', () => renderProgress());

document.getElementById('progreso-content')?.addEventListener('click', (e) => {
  const row = e.target.closest('tr[data-student-id]');
  if (row) navigate('alumno', { id: row.dataset.studentId, from: 'progreso' });
});

export async function renderProgress(params = {}) {
  const content = document.getElementById('progreso-content');
  content.innerHTML = loading;

  try {
    const [profiles, groups] = await Promise.all([getAllProfiles(), getGroups()]);

    // Selector de grupo: por defecto el primero
    const wanted = params.groupId ?? groupSelect.value;
    groupSelect.innerHTML = groups.map(g => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.name)}</option>`).join('')
      + '<option value="__all">Todos mis alumnos</option>';
    groupSelect.value = groups.some(g => g.id === wanted) || wanted === '__all' ? wanted : (groups[0]?.id ?? '__all');

    const groupId  = groupSelect.value;
    const students = profiles
      .filter(p => p.role === 'student' && (groupId === '__all' || p.group_id === groupId))
      .sort((a, b) => a.full_name.localeCompare(b.full_name, 'es'));

    if (students.length === 0) {
      content.innerHTML = '<div class="card empty-state">Este grupo todavía no tiene alumnos.</div>';
      return;
    }

    const ids  = students.map(s => s.id);
    const days = Number(periodSelect.value) || null;
    const [results, writings] = await Promise.all([getResultsForUsers(ids), listWritings({ studentIds: ids })]);
    const periodResults  = since(results, days);
    const periodWritings = since(writings, days, 'submitted_at');

    // Resumen por alumno
    const rows = students.map(s => {
      const mine = periodResults.filter(r => r.user_id === s.id);
      return {
        student: s,
        summary: summarize(mine),
        writing: writingSummary(periodWritings.filter(w => w.student_id === s.id)),
        skills:  skillsForLevel(s.level),
      };
    });

    const showUoe = rows.some(r => r.skills.includes('use-of-english'));
    const skillCols = EXERCISE_SKILLS.filter(s => s !== 'use-of-english' || showUoe);

    const groupAvg = (skill) => avgOf(rows.map(r => r.summary.skills[skill]?.avg));
    const inactive = rows.filter(r => r.summary.count === 0 && r.writing.sent === 0).length;

    content.innerHTML = `
      ${inactive ? `<div class="insight insight-warn">⚠️ <strong>${inactive}</strong> de ${rows.length} alumnos no han hecho nada ${days ? `en los últimos ${days} días` : 'todavía'}.</div>` : ''}
      <div class="card" style="padding:0;overflow-x:auto">
        <table class="table progress-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Último acceso</th>
              <th class="num" title="Ejercicios hechos en el periodo">Ejercicios</th>
              ${skillCols.map(s => `<th class="num">${SKILL_NAMES[s]}</th>`).join('')}
              <th class="num" title="Media de los writings corregidos, sobre 20">Writing</th>
              <th class="num">Media</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(({ student, summary, writing, skills }) => `
              <tr class="row-link ${summary.count === 0 && writing.sent === 0 ? 'row-inactive' : ''}" data-student-id="${escapeHtml(student.id)}">
                <td><strong>${escapeHtml(student.full_name)}</strong> <span class="badge badge-level">${escapeHtml(student.level || '')}</span></td>
                <td>${lastSeenBadge(student.last_seen_at)}</td>
                <td class="num">${summary.count}</td>
                ${skillCols.map(s => `<td class="num">${skills.includes(s)
                  ? pill(summary.skills[s]?.avg, summary.skills[s] ? `<small class="muted"> ${summary.skills[s].count}</small>` : '')
                  : '<span class="muted">n/a</span>'}</td>`).join('')}
                <td class="num">${writing.avg20 !== null ? `<strong>${writing.avg20}</strong>/20` : '—'}${writing.pending ? ` <span class="badge badge-pending" title="Pendientes de corregir">${writing.pending}</span>` : ''}</td>
                <td class="num">${pill(summary.avg)}</td>
              </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Media del grupo</strong></td>
              ${skillCols.map(s => `<td class="num">${pill(groupAvg(s))}</td>`).join('')}
              <td class="num">${(() => { const v = rows.map(r => r.writing.avg20).filter(x => x !== null);
                return v.length ? `<strong>${Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10}</strong>/20` : '—'; })()}</td>
              <td class="num">${pill(avgOf(rows.map(r => r.summary.avg)))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p class="table-help">Porcentaje medio de aciertos por destreza (el número pequeño es cuántos ejercicios ha hecho).
        La media del grupo es la media de los alumnos. Pulsa un alumno para ver su ficha completa.</p>`;
  } catch (err) {
    content.innerHTML = errorBox(err);
  }
}

// ════════════════════════════════════════════════════════════
// FICHA DE UN ALUMNO
//   profesora/admin → page-alumno · alumno → "Mis resultados"
// ════════════════════════════════════════════════════════════
export async function renderStudentReport({ studentId, currentUser, containerId, backTo }) {
  const content = document.getElementById(containerId);
  content.innerHTML = loading;
  const staff = currentUser.role !== 'student';

  try {
    let student = currentUser;
    let groupName = null;
    if (staff) {
      const [profiles, groups] = await Promise.all([getAllProfiles(), getGroups()]);
      student   = profiles.find(p => p.id === studentId);
      groupName = groups.find(g => g.id === student?.group_id)?.name;
      if (!student) throw new Error('No se ha encontrado el alumno.');
    }

    const [results, writings] = await Promise.all([
      getResultsForUsers([student.id]),
      staff ? listWritings({ studentIds: [student.id] }) : listWritings(),
    ]);
    const summary = summarize(results);
    const ws      = writingSummary(writings);
    const ranking = partsRanking(summary);
    const weakest = ranking[0];
    const strongest = ranking.length > 1 ? ranking[ranking.length - 1] : null;
    const last7   = since(results, 7).length;

    const skills = skillsForLevel(student.level)
      .concat(Object.keys(summary.skills).filter(s => !skillsForLevel(student.level).includes(s))); // por si cambió de nivel

    content.innerHTML = `
      ${staff ? `
        <button class="btn btn-ghost" id="alumno-back" style="margin-bottom:var(--space-5)">← Volver</button>
        <div class="page-header">
          <h1 class="page-title">${escapeHtml(student.full_name)}</h1>
          <p class="page-subtitle">
            <span class="badge badge-level">${escapeHtml(student.level || '—')}</span>
            ${groupName ? ` · ${escapeHtml(groupName)}` : ' · Sin grupo'}
            · Último acceso: ${lastSeenBadge(student.last_seen_at)}
          </p>
        </div>` : ''}

      <div class="stat-grid" style="margin-bottom:var(--space-6)">
        <div class="stat-card">
          <div class="stat-label">Ejercicios hechos</div>
          <div class="stat-value">${summary.count}</div>
          <div class="stat-sub">${last7} en los últimos 7 días</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Media de aciertos</div>
          <div class="stat-value ${scoreClass(summary.avg)}-text">${summary.avg ?? '—'}${summary.avg !== null ? '%' : ''}</div>
          <div class="stat-sub">en todos los ejercicios</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Writings</div>
          <div class="stat-value">${ws.avg20 !== null ? `${ws.avg20}<small>/20</small>` : '—'}</div>
          <div class="stat-sub">${ws.reviewed} corregidos · ${ws.pending} pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Última práctica</div>
          <div class="stat-value" style="font-size:1.2rem">${summary.lastDate ? formatDate(summary.lastDate) : '—'}</div>
          <div class="stat-sub">ejercicio autocorregido</div>
        </div>
      </div>

      ${weakest || strongest ? `
        <div class="insights">
          ${weakest ? `<div class="insight insight-warn">🎯 <strong>${staff ? 'Necesita reforzar' : 'A reforzar'}:</strong>
            ${escapeHtml(SKILL_NAMES[weakest.skill] || weakest.skill)} · ${escapeHtml(partLabel(student.level, weakest.skill, weakest.part))}
            — ${weakest.avg}% de media en ${weakest.count} intentos</div>` : ''}
          ${strongest && strongest.avg > weakest.avg ? `<div class="insight insight-ok">⭐ <strong>Punto fuerte:</strong>
            ${escapeHtml(SKILL_NAMES[strongest.skill] || strongest.skill)} · ${escapeHtml(partLabel(student.level, strongest.skill, strongest.part))}
            — ${strongest.avg}% de media</div>` : ''}
        </div>` : ''}

      <div class="section-title">Por destreza</div>
      <div class="skill-report-grid">
        ${skills.map(skill => skillCard(skill, summary.skills[skill], student.level)).join('')}
      </div>

      <div class="section-title">Últimos ejercicios</div>
      ${results.length ? `
        <div class="card" style="padding:0;overflow-x:auto">
          <table class="table">
            <thead><tr><th>Fecha</th><th>Destreza</th><th>Parte</th><th>Ejercicio</th><th class="num">Aciertos</th></tr></thead>
            <tbody>
              ${results.slice(0, 20).map(r => `
                <tr>
                  <td class="muted">${formatDate(r.completed_at)}</td>
                  <td>${escapeHtml(SKILL_NAMES[r.exam] || r.exam)}</td>
                  <td>${escapeHtml(partLabel(student.level, r.exam, r.part))}</td>
                  <td>${escapeHtml(r.exercise_id)}</td>
                  <td class="num">${pill(r.score)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${results.length > 20 ? `<p class="table-help">Se muestran los 20 más recientes de ${results.length}.</p>` : ''}`
        : `<div class="card empty-state">${staff ? 'Todavía no ha hecho ningún ejercicio.' : 'Todavía no has completado ningún ejercicio.'}</div>`}

      <div class="section-title">Writings</div>
      ${writings.length ? `
        <div class="card" style="padding:0;overflow-x:auto">
          <table class="table">
            <thead><tr><th>Enviado</th><th>Tarea</th><th>Palabras</th><th>Estado</th><th class="num">Nota</th></tr></thead>
            <tbody>
              ${writings.map(w => {
                const t = totalScore(w);
                return `
                <tr class="row-link" data-writing-id="${escapeHtml(w.id)}">
                  <td class="muted">${formatDate(w.submitted_at)}</td>
                  <td>${escapeHtml(w.task_type)} · ${escapeHtml(w.prompt_title)}</td>
                  <td>${w.word_count}</td>
                  <td>${w.status === 'reviewed' ? '<span class="badge badge-reviewed">Corregido</span>' : '<span class="badge badge-pending">Pendiente</span>'}</td>
                  <td class="num">${t === null ? '—' : `<strong>${t}</strong>/20`}</td>
                </tr>`; }).join('')}
            </tbody>
          </table>
        </div>`
        : `<div class="card empty-state">${staff ? 'No ha enviado ningún writing.' : 'Todavía no has enviado ningún writing.'}</div>`}
    `;

    document.getElementById('alumno-back')?.addEventListener('click', () => navigate(backTo || 'progreso'));
    content.querySelectorAll('tr[data-writing-id]').forEach(tr =>
      tr.addEventListener('click', () => navigate('writing', { id: tr.dataset.writingId })));
  } catch (err) {
    content.innerHTML = errorBox(err);
  }
}

function skillCard(skill, s, level) {
  const name = SKILL_NAMES[skill] || skill;
  if (!s) {
    return `
      <div class="card skill-report">
        <div class="skill-report-head"><span class="skill-report-name">${escapeHtml(name)}</span>${pill(null)}</div>
        <p class="muted" style="font-size:var(--text-sm)">Sin ejercicios todavía.</p>
      </div>`;
  }
  const parts = Object.entries(s.parts).sort((a, b) => Number(a[0]) - Number(b[0]));
  return `
    <div class="card skill-report">
      <div class="skill-report-head">
        <span class="skill-report-name">${escapeHtml(name)}</span>
        <span>${trendHtml(s.trend)} <span class="score-big ${scoreClass(s.avg)}-text">${s.avg}%</span></span>
      </div>
      <div class="bar"><div class="bar-fill ${scoreClass(s.avg)}" style="width:${s.avg}%"></div></div>
      <div class="skill-report-meta">${s.count} ${s.count === 1 ? 'ejercicio' : 'ejercicios'} · mejor nota ${s.best}% · última ${s.lastScore}%</div>
      <table class="mini-table">
        <thead><tr><th>Parte</th><th class="num">Intentos</th><th class="num">Media</th><th class="num">Mejor</th></tr></thead>
        <tbody>
          ${parts.map(([p, ps]) => `
            <tr>
              <td>${escapeHtml(partLabel(level, skill, p))}</td>
              <td class="num">${ps.count}</td>
              <td class="num">${pill(ps.avg)}</td>
              <td class="num muted">${ps.best}%</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}
