// ════════════════════════════════════════════════════════════
// VISTAS DE GESTIÓN
//   · Grupos: teacher → sus grupos y alumnos · admin → crear/editar/borrar
//   · Usuarios (solo admin): alumnos y teachers
// ════════════════════════════════════════════════════════════
import { createUser, getAllProfiles, deleteUser, setStudentGroup, getRecentActivity } from '../auth.js';
import { getGroups, createGroup, setGroupTeacher, deleteGroup } from '../groups.js';
import { navigate } from '../router.js';
import { showToast, escapeHtml, lastSeenBadge } from '../ui.js';

const ACTIVITY_DAYS = 7;

let currentUser = null;
export function setAdminUser(user) { currentUser = user; }

const ROLE_BADGE = {
  admin:   '<span class="badge badge-admin">Admin</span>',
  teacher: '<span class="badge badge-teacher">Teacher</span>',
  student: '<span class="badge badge-student">Alumno</span>',
};

function groupOptions(groups, selectedId, emptyLabel = 'Sin grupo') {
  return `<option value="">${emptyLabel}</option>` + groups.map(g =>
    `<option value="${escapeHtml(g.id)}" ${g.id === selectedId ? 'selected' : ''}>${escapeHtml(g.name)}</option>`
  ).join('');
}

function teacherOptions(teachers, selectedId) {
  return `<option value="">Sin teacher</option>` + teachers.map(t =>
    `<option value="${escapeHtml(t.id)}" ${t.id === selectedId ? 'selected' : ''}>${escapeHtml(t.full_name)}</option>`
  ).join('');
}

// ════════════════════════════════════════════════════════════
// GRUPOS
// ════════════════════════════════════════════════════════════
export async function renderGroups() {
  const content = document.getElementById('grupos-content');
  const isAdmin = currentUser.role === 'admin';
  document.getElementById('grupos-subtitle').textContent = isAdmin
    ? 'Crea grupos y asígnales una teacher. Los alumnos se asignan en Gestión de usuarios.'
    : 'Tus grupos y sus alumnos';
  content.innerHTML = '<p style="color:var(--color-text-muted)">Cargando...</p>';

  try {
    const [groups, profiles, activity] = await Promise.all([getGroups(), getAllProfiles(), getRecentActivity(ACTIVITY_DAYS)]);
    const teachers = profiles.filter(p => p.role === 'teacher' || p.role === 'admin');
    const byId     = new Map(profiles.map(p => [p.id, p]));

    if (isAdmin) {
      document.getElementById('new-group-teacher').innerHTML = teacherOptions(teachers.filter(t => t.role === 'teacher'), null);
    }

    if (groups.length === 0) {
      content.innerHTML = `<div class="card empty-state">${isAdmin
        ? 'Todavía no hay grupos. Crea el primero arriba.'
        : 'Todavía no tienes grupos asignados. Pídeselo a la administración.'}</div>`;
      return;
    }

    content.innerHTML = `<div class="group-grid">${groups.map(g => {
      const students = profiles.filter(p => p.role === 'student' && p.group_id === g.id);
      const teacher  = byId.get(g.teacher_id);
      return `
        <div class="card" data-group-id="${escapeHtml(g.id)}">
          <div class="group-card-head">
            <div class="card-title" style="margin:0">${escapeHtml(g.name)}</div>
            ${g.level ? `<span class="badge badge-level">${escapeHtml(g.level)}</span>` : ''}
          </div>
          ${isAdmin
            ? `<div class="form-field" style="margin-bottom:var(--space-3)">
                 <label class="form-label">Teacher</label>
                 <select class="form-select" data-action="set-teacher">${teacherOptions(teachers, g.teacher_id)}</select>
               </div>`
            : `<div class="group-teacher">👩‍🏫 ${escapeHtml(teacher?.full_name || 'Sin teacher')}</div>`}
          <div class="form-label" style="margin-bottom:var(--space-2)">Alumnos (${students.length})</div>
          ${students.length
            ? `<table class="group-students">
                 <thead><tr><th>Alumno</th><th>Último acceso</th><th title="Ejercicios hechos en los últimos ${ACTIVITY_DAYS} días">Ejerc. ${ACTIVITY_DAYS}d</th></tr></thead>
                 <tbody>${students.map(s => `
                   <tr class="row-link" data-student-id="${escapeHtml(s.id)}" title="Ver progreso de ${escapeHtml(s.full_name)}">
                     <td>${escapeHtml(s.full_name)}<div class="group-username">${escapeHtml(s.username)}</div></td>
                     <td>${lastSeenBadge(s.last_seen_at)}</td>
                     <td class="num">${activity.get(s.id) || 0}</td>
                   </tr>`).join('')}
                 </tbody>
               </table>`
            : '<p style="font-size:var(--text-sm);color:var(--color-text-faint)">Sin alumnos todavía.</p>'}
          <div class="group-actions">
            <button class="btn btn-primary btn-sm" data-action="progress">Ver progreso</button>
            <button class="btn btn-ghost btn-sm" data-action="writings">Ver writings</button>
            ${isAdmin ? '<button class="btn btn-danger btn-sm" data-action="delete">Eliminar grupo</button>' : ''}
          </div>
        </div>`;
    }).join('')}</div>`;
  } catch (err) {
    content.innerHTML = `<div class="alert alert-error visible">${escapeHtml(err.message)}</div>`;
  }
}

const groupsContent = document.getElementById('grupos-content');

groupsContent?.addEventListener('click', async (e) => {
  const studentRow = e.target.closest('tr[data-student-id]');
  if (studentRow) { navigate('alumno', { id: studentRow.dataset.studentId, from: 'grupos' }); return; }

  const btn  = e.target.closest('button[data-action]');
  const card = e.target.closest('[data-group-id]');
  if (!btn || !card) return;
  const groupId = card.dataset.groupId;

  if (btn.dataset.action === 'progress') navigate('progreso', { groupId });
  if (btn.dataset.action === 'writings') {
    navigate('writings', { groupId });
  }
  if (btn.dataset.action === 'delete') {
    const name = card.querySelector('.card-title').textContent;
    if (!confirm(`¿Eliminar el grupo "${name}"? Los alumnos no se borran: se quedan sin grupo.`)) return;
    try {
      await deleteGroup(groupId);
      showToast('Grupo eliminado');
      renderGroups();
    } catch (err) { showToast(err.message, 'error'); }
  }
});

groupsContent?.addEventListener('change', async (e) => {
  const select = e.target.closest('select[data-action="set-teacher"]');
  if (!select) return;
  try {
    await setGroupTeacher(select.closest('[data-group-id]').dataset.groupId, select.value);
    showToast('Teacher actualizada');
  } catch (err) {
    showToast(err.message, 'error');
    renderGroups();
  }
});

document.getElementById('add-group-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    await createGroup({
      name:      document.getElementById('new-group-name').value,
      level:     document.getElementById('new-group-level').value,
      teacherId: document.getElementById('new-group-teacher').value,
    });
    showToast('Grupo creado');
    e.target.reset();
    renderGroups();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

// ════════════════════════════════════════════════════════════
// USUARIOS (solo admin)
// ════════════════════════════════════════════════════════════
const ROLE_ORDER = { admin: 0, teacher: 1, student: 2 };

export async function renderUsers() {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;

  try {
    const [profiles, groups] = await Promise.all([getAllProfiles(), getGroups()]);
    document.getElementById('new-group').innerHTML = groupOptions(groups, null);

    profiles.sort((a, b) => (ROLE_ORDER[a.role] - ROLE_ORDER[b.role]) || a.full_name.localeCompare(b.full_name, 'es'));

    tbody.innerHTML = profiles.map(p => `
      <tr data-user-id="${escapeHtml(p.id)}" data-user-name="${escapeHtml(p.full_name)}">
        <td><code>${escapeHtml(p.username)}</code></td>
        <td>${escapeHtml(p.full_name)}</td>
        <td>${ROLE_BADGE[p.role] || escapeHtml(p.role)}</td>
        <td>${p.level ? `<span class="badge badge-level">${escapeHtml(p.level)}</span>` : '—'}</td>
        <td>${lastSeenBadge(p.last_seen_at)}</td>
        <td>${p.role === 'student'
          ? `<select class="form-select" data-action="set-group" aria-label="Grupo de ${escapeHtml(p.full_name)}">${groupOptions(groups, p.group_id)}</select>`
          : '—'}</td>
        <td>${p.id !== currentUser.id
          ? '<button class="btn btn-danger btn-sm" data-action="delete">Eliminar</button>'
          : '<span style="font-size:0.75rem;color:#aaa">Tú</span>'}</td>
      </tr>`).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

const usersTbody = document.getElementById('students-tbody');

usersTbody?.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="delete"]');
  if (!btn) return;
  const row = btn.closest('tr');
  if (!confirm(`¿Eliminar a ${row.dataset.userName}? Se borrarán también sus resultados y writings. No se puede deshacer.`)) return;
  try {
    await deleteUser(row.dataset.userId);
    showToast('Usuario eliminado');
    renderUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

usersTbody?.addEventListener('change', async (e) => {
  const select = e.target.closest('select[data-action="set-group"]');
  if (!select) return;
  try {
    await setStudentGroup(select.closest('tr').dataset.userId, select.value);
    showToast('Grupo actualizado');
  } catch (err) {
    showToast(err.message, 'error');
    renderUsers();
  }
});

// Alumno → nivel y grupo; teacher → no
const roleSelect = document.getElementById('new-role');
roleSelect?.addEventListener('change', () => {
  document.getElementById('new-student-fields').hidden = roleSelect.value !== 'student';
});

document.getElementById('add-student-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled    = true;
  btn.textContent = 'Guardando...';

  const role = roleSelect.value;
  try {
    await createUser({
      role,
      username: document.getElementById('new-username').value,
      fullName: document.getElementById('new-name').value,
      password: document.getElementById('new-password').value,
      level:    document.getElementById('new-level').value,
      groupId:  document.getElementById('new-group').value || null,
    });
    showToast(role === 'teacher' ? 'Teacher añadida correctamente' : 'Alumno añadido correctamente');
    e.target.reset();
    document.getElementById('new-student-fields').hidden = false;
    renderUsers();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Añadir usuario';
  }
});
