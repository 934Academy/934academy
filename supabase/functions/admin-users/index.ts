// ════════════════════════════════════════════════════════════
// EDGE FUNCTION: admin-users
// Crea y elimina alumnos (cuenta de Auth + perfil + resultados).
// Usa la service role key, que solo existe en el servidor de Supabase.
// Solo responde si quien llama tiene role = 'admin' en profiles.
// ════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const EMAIL_DOMAIN = '@934academy.local';
const LEVELS       = ['A1', 'A2', 'B1', 'B2', 'C1'];
const ROLES        = ['student', 'teacher']; // los admins se crean a mano en Supabase

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Método no permitido.' }, 405);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  // ── Comprobar que quien llama es admin ──
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return json({ error: 'No autenticado.' }, 401);

  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user) return json({ error: 'No autenticado.' }, 401);

  const { data: caller } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (caller?.role !== 'admin') return json({ error: 'Solo un administrador puede hacer esto.' }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return json({ error: 'Petición no válida.' }, 400); }

  // ─────────────────────────────────────────────
  // CREAR ALUMNO
  // ─────────────────────────────────────────────
  if (body.action === 'create') {
    const username  = String(body.username ?? '').trim().toLowerCase();
    const fullName  = String(body.fullName ?? '').trim();
    const password  = String(body.password ?? '');
    const role      = String(body.role ?? 'student');
    const isStudent = role === 'student';
    const level     = isStudent ? String(body.level ?? '') : null;
    const groupId   = isStudent && body.groupId ? String(body.groupId) : null;

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) return json({ error: 'Usuario no válido: 3-32 caracteres, solo letras, números, punto, guion o guion bajo.' }, 400);
    if (!fullName)                             return json({ error: 'Falta el nombre completo.' }, 400);
    if (password.length < 6)                   return json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, 400);
    if (!ROLES.includes(role))                 return json({ error: 'Rol no válido.' }, 400);
    if (isStudent && !LEVELS.includes(level!)) return json({ error: 'Nivel no válido.' }, 400);

    if (groupId) {
      const { data: group } = await admin.from('groups').select('id').eq('id', groupId).maybeSingle();
      if (!group) return json({ error: 'El grupo no existe.' }, 400);
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: username + EMAIL_DOMAIN,
      password,
      email_confirm: true,
    });
    if (createError) {
      const msg = /already/i.test(createError.message) ? 'Ese usuario ya existe.' : createError.message;
      return json({ error: msg }, 400);
    }

    const { error: profileError } = await admin.from('profiles').insert({
      id:        created.user.id,
      username,
      full_name: fullName,
      level,
      role,
      group_id:  groupId,
    });
    if (profileError) {
      // Deshacer: no dejar una cuenta sin perfil
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: profileError.message }, 400);
    }

    return json({ id: created.user.id });
  }

  // ─────────────────────────────────────────────
  // ELIMINAR ALUMNO (resultados + perfil + cuenta)
  // ─────────────────────────────────────────────
  if (body.action === 'delete') {
    const userId = String(body.userId ?? '');
    if (!userId)            return json({ error: 'Falta el alumno.' }, 400);
    if (userId === user.id) return json({ error: 'No puedes eliminar tu propia cuenta.' }, 400);

    const { error: resultsError } = await admin.from('results').delete().eq('user_id', userId);
    if (resultsError) return json({ error: resultsError.message }, 400);

    const { error: writingsError } = await admin.from('writings').delete().eq('student_id', userId);
    if (writingsError) return json({ error: writingsError.message }, 400);

    // Si es profesora, sus grupos se quedan sin responsable (groups.teacher_id → null)

    const { error: profileError } = await admin.from('profiles').delete().eq('id', userId);
    if (profileError) return json({ error: profileError.message }, 400);

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError && !/not found/i.test(deleteError.message)) return json({ error: deleteError.message }, 400);

    return json({ ok: true });
  }

  return json({ error: 'Acción desconocida.' }, 400);
});
