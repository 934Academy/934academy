import { supabase } from './supabase.js';

const EMAIL_DOMAIN   = '@934academy.local';
const PROFILE_FIELDS = 'id, username, full_name, level, role, group_id, last_seen_at, created_at';

// Usuario de la sesión actual (se guarda tras login/getSession para no
// pedírselo a Supabase en cada consulta)
let currentUserId = null;

function requireUserId() {
  if (!currentUserId) throw new Error('Sesión no encontrada. Vuelve a iniciar sesión.');
  return currentUserId;
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', userId)
    .single();
  if (error) return null;
  currentUserId = data.id;
  touchLastSeen();
  return data;
}

// ─────────────────────────────────────────────
// ÚLTIMO ACCESO: se apunta al entrar y al navegar, como mucho
// cada 5 min (el servidor también lo limita). No bloquea la página.
// ─────────────────────────────────────────────
const TOUCH_EVERY_MS = 5 * 60 * 1000;
let lastTouch = 0;

export function touchLastSeen() {
  if (!currentUserId || Date.now() - lastTouch < TOUCH_EVERY_MS) return;
  lastTouch = Date.now();
  supabase.rpc('touch_last_seen').then(({ error }) => { if (error) lastTouch = 0; });
}

// ─────────────────────────────────────────────
// RESULTADOS DE VARIOS ALUMNOS (profesora/admin; la RLS filtra)
// ─────────────────────────────────────────────
export async function getResultsForUsers(userIds) {
  if (!userIds.length) return [];
  const { data, error } = await supabase
    .from('results')
    .select('user_id, exam, part, exercise_id, score, completed_at')
    .in('user_id', userIds)
    .order('completed_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ─────────────────────────────────────────────
// ACTIVIDAD RECIENTE: nº de ejercicios por alumno en los últimos N días
// (la RLS limita a los alumnos que puede ver cada uno)
// ─────────────────────────────────────────────
export async function getRecentActivity(days = 7) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase
    .from('results')
    .select('user_id')
    .gte('completed_at', since);
  if (error) throw new Error(error.message);

  const counts = new Map();
  for (const r of data) counts.set(r.user_id, (counts.get(r.user_id) || 0) + 1);
  return counts;
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export async function login(username, password) {
  const email = username.trim().toLowerCase() + EMAIL_DOMAIN;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // 400 = credenciales incorrectas; otro estado (o ninguno) = servidor caído, sin red, proyecto pausado...
    if (error.status === 400) throw new Error('Usuario o contraseña incorrectos.');
    throw new Error('No se puede conectar con el servidor. Inténtalo más tarde.');
  }

  const profile = await fetchProfile(data.user.id);
  if (!profile) {
    // No dejar una sesión abierta sin perfil
    await supabase.auth.signOut();
    throw new Error('No se pudo cargar el perfil del usuario.');
  }
  return profile;
}

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export async function logout() {
  currentUserId = null;
  await supabase.auth.signOut();
}

// ─────────────────────────────────────────────
// SESIÓN ACTIVA
// ─────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return fetchProfile(session.user.id);
}

// ─────────────────────────────────────────────
// LLAMADA A LA EDGE FUNCTION DE ADMIN
// Crear/borrar cuentas necesita la service role key, que solo
// vive en el servidor (supabase/functions/admin-users).
// ─────────────────────────────────────────────
async function callAdminFunction(body) {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  if (error) {
    // En errores HTTP el mensaje real viene en el cuerpo de la respuesta
    let message = error.message;
    try { message = (await error.context.json()).error || message; } catch {}
    throw new Error(message);
  }
  return data;
}

// ─────────────────────────────────────────────
// CREAR USUARIO: alumno o profesora (solo admin)
// ─────────────────────────────────────────────
export async function createUser({ username, fullName, password, role, level, groupId }) {
  return callAdminFunction({ action: 'create', username, fullName, password, role, level, groupId });
}

// ─────────────────────────────────────────────
// PERFILES VISIBLES (admin: todos; profesora: los de sus grupos)
// ─────────────────────────────────────────────
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .order('full_name');

  if (error) throw new Error(error.message);
  return data;
}

// ─────────────────────────────────────────────
// CAMBIAR GRUPO DE UN ALUMNO (solo admin)
// ─────────────────────────────────────────────
export async function setStudentGroup(userId, groupId) {
  const { error } = await supabase
    .from('profiles')
    .update({ group_id: groupId || null })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// ELIMINAR USUARIO (solo admin): resultados + writings + perfil + cuenta
// ─────────────────────────────────────────────
export async function deleteUser(userId) {
  await callAdminFunction({ action: 'delete', userId });
}

// ─────────────────────────────────────────────
// GUARDAR RESULTADO
// ─────────────────────────────────────────────
export async function saveResult({ exam, part, exerciseId, score }) {
  const { error } = await supabase.from('results').insert({
    user_id:     requireUserId(),
    exam,
    part,
    exercise_id: exerciseId,
    score,
  });

  if (error) throw new Error(error.message);
}

