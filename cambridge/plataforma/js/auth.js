import { supabase } from './supabase.js';

const EMAIL_DOMAIN = '@934academy.local';

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export async function login(username, password) {
  const email = username.trim().toLowerCase() + EMAIL_DOMAIN;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Usuario o contraseña incorrectos.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) throw new Error('No se pudo cargar el perfil del alumno.');
  return profile;
}

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export async function logout() {
  await supabase.auth.signOut();
}

// ─────────────────────────────────────────────
// SESIÓN ACTIVA
// ─────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return profile || null;
}

// ─────────────────────────────────────────────
// CREAR ALUMNO (solo admin)
// ─────────────────────────────────────────────
export async function createStudent({ username, fullName, password, level }) {
  const email = username.trim().toLowerCase() + EMAIL_DOMAIN;

  const { data: { session: adminSession } } = await supabase.auth.getSession();

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id:        data.user.id,
      username:  username.trim().toLowerCase(),
      full_name: fullName.trim(),
      level,
      role:      'student',
    });
  if (profileError) throw new Error(profileError.message);

  await supabase.auth.setSession({
    access_token:  adminSession.access_token,
    refresh_token: adminSession.refresh_token,
  });

  return data.user;
}

// ─────────────────────────────────────────────
// OBTENER TODOS LOS ALUMNOS (solo admin)
// ─────────────────────────────────────────────
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// ─────────────────────────────────────────────
// ELIMINAR ALUMNO (solo admin)
// ─────────────────────────────────────────────
export async function deleteStudent(userId) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// GUARDAR RESULTADO
// ─────────────────────────────────────────────
export async function saveResult({ exam, part, exerciseId, score }) {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('SESSION:', session);
  console.log('USER ID:', session?.user?.id);
  if (!session?.user) throw new Error('Sesión no encontrada. Vuelve a iniciar sesión.');

  const { error } = await supabase.from('results').insert({
    user_id:     session.user.id,
    exam,
    part,
    exercise_id: exerciseId,
    score,
  });

  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// OBTENER RESULTADOS DEL USUARIO ACTUAL
// ─────────────────────────────────────────────
export async function getResults() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Sesión no encontrada.');

  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('user_id', session.user.id)
    .order('completed_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}