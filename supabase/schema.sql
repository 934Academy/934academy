-- ════════════════════════════════════════════════════════════
-- ESQUEMA COMPLETO DE LA BASE DE DATOS — 9¾ Academy (Cambridge)
-- Ejecutar en Supabase → SQL Editor. Se puede ejecutar varias veces:
-- no borra datos (alumnos, resultados y writings se conservan).
-- Sustituye a seguridad.sql.
-- ════════════════════════════════════════════════════════════
--
-- ROLES (profiles.role)
--   · student : alumno. Tiene nivel y pertenece a un grupo.
--   · teacher : profesora. Tiene uno o varios grupos.
--   · admin   : dirección. Ve y gestiona todo.
--
-- TABLAS
--   · profiles : un perfil por cuenta de Auth.
--   · groups   : grupos de clase; cada grupo tiene una profesora.
--   · results  : notas de los ejercicios autocorregidos.
--   · writings : textos que envían los alumnos + feedback de la profesora.
--
-- QUIÉN VE QUÉ (RLS)
--   · Alumno    → su perfil, su grupo, su profesora, sus resultados y writings.
--   · Profesora → sus grupos, los alumnos de sus grupos y sus resultados/writings.
--   · Admin     → todo.
--   · Crear/borrar cuentas: solo la Edge Function "admin-users".
--   · Enviar y corregir writings: solo con las funciones submit_writing y
--     review_writing (así nadie puede ponerse nota a sí mismo).
-- ════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────
-- 1. TABLAS
-- ────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  full_name   text not null,
  level       text,
  role        text not null default 'student',
  created_at  timestamptz not null default now()
);

create table if not exists public.results (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  exam         text not null,
  part         text not null,
  exercise_id  text not null,
  score        integer not null,
  completed_at timestamptz not null default now()
);

create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  level       text check (level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  teacher_id  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.writings (
  id                   uuid primary key default gen_random_uuid(),
  student_id           uuid not null references public.profiles(id) on delete cascade,
  level                text not null,
  task_type            text not null,
  prompt_id            text,
  prompt_title         text not null,
  prompt_text          text not null,
  content              text not null check (char_length(content) between 1 and 20000),
  word_count           integer not null,
  status               text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  submitted_at         timestamptz not null default now(),
  -- Corrección (la rellena la profesora con review_writing)
  feedback             text,
  score_content        smallint check (score_content       between 0 and 5),
  score_communicative  smallint check (score_communicative between 0 and 5),
  score_organisation   smallint check (score_organisation  between 0 and 5),
  score_language       smallint check (score_language      between 0 and 5),
  reviewed_by          uuid references public.profiles(id) on delete set null,
  reviewed_at          timestamptz
);


-- ────────────────────────────────────────────────────────────
-- 2. BORRAR POLÍTICAS ANTERIORES (se recrean abajo)
-- ────────────────────────────────────────────────────────────
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('profiles', 'results', 'groups', 'writings')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;


-- ────────────────────────────────────────────────────────────
-- 3. AJUSTES SOBRE LA TABLA profiles QUE YA EXISTÍA
-- ────────────────────────────────────────────────────────────

-- role pasa a ser texto con 3 valores posibles (antes solo student/admin)
alter table public.profiles alter column role drop default;
alter table public.profiles alter column role type text using role::text;
alter table public.profiles alter column role set default 'student';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add  constraint profiles_role_check
  check (role in ('student', 'teacher', 'admin'));

-- Las profesoras y el admin no tienen nivel; los alumnos sí
alter table public.profiles alter column level drop not null;

-- Quitar primero las reglas antiguas de nivel (la vieja permitía level = 'admin')
alter table public.profiles drop constraint if exists profiles_level_check;
alter table public.profiles drop constraint if exists profiles_student_level_check;

-- Limpiar niveles antiguos: quien no es alumno, sin nivel; ' b2 ' → 'B2', '' → null
update public.profiles set level = null
  where role <> 'student' and level is not null;
update public.profiles set level = nullif(upper(btrim(level)), '')
  where level is distinct from nullif(upper(btrim(level)), '');

-- "not valid": las reglas se aplican a los usuarios nuevos y a los cambios,
-- sin fallar por filas antiguas raras
alter table public.profiles add  constraint profiles_level_check
  check (level is null or level in ('A1', 'A2', 'B1', 'B2', 'C1')) not valid;
alter table public.profiles add  constraint profiles_student_level_check
  check (role <> 'student' or level is not null) not valid;

-- Grupo del alumno
alter table public.profiles
  add column if not exists group_id uuid references public.groups(id) on delete set null;

-- Último acceso a la plataforma (lo apunta la web con touch_last_seen)
alter table public.profiles add column if not exists last_seen_at timestamptz;


-- ────────────────────────────────────────────────────────────
-- 4. ÍNDICES (para que las consultas de RLS y listados vayan rápidas)
-- ────────────────────────────────────────────────────────────
create index if not exists profiles_group_id_idx        on public.profiles (group_id);
create index if not exists groups_teacher_id_idx        on public.groups   (teacher_id);
create index if not exists results_user_completed_idx   on public.results  (user_id, completed_at desc);
create index if not exists writings_student_idx         on public.writings (student_id, submitted_at desc);
create index if not exists writings_status_idx          on public.writings (status, submitted_at desc);


-- ────────────────────────────────────────────────────────────
-- 5. FUNCIONES AUXILIARES PARA RLS
-- security definer: leen profiles sin pasar por su propia RLS
-- (si no, habría recursión infinita).
-- ────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ¿Es el usuario actual la profesora del grupo de este alumno?
create or replace function public.is_teacher_of(p_student uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.profiles s
    join public.groups g on g.id = s.group_id
    where s.id = p_student and g.teacher_id = (select auth.uid())
  );
$$;

-- ¿Es esta persona la profesora del usuario actual?
create or replace function public.is_my_teacher(p_teacher uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.profiles me
    join public.groups g on g.id = me.group_id
    where me.id = (select auth.uid()) and g.teacher_id = p_teacher
  );
$$;

create or replace function public.my_group_id()
returns uuid language sql security definer stable set search_path = '' as $$
  select group_id from public.profiles where id = (select auth.uid());
$$;

-- Solo una profesora (o el admin) puede ser responsable de un grupo
create or replace function public.groups_check_teacher()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.teacher_id is not null and not exists (
    select 1 from public.profiles where id = new.teacher_id and role in ('teacher', 'admin')
  ) then
    raise exception 'La responsable del grupo debe ser una profesora.';
  end if;
  return new;
end $$;

drop trigger if exists groups_check_teacher on public.groups;
create trigger groups_check_teacher
  before insert or update of teacher_id on public.groups
  for each row execute function public.groups_check_teacher();


-- ────────────────────────────────────────────────────────────
-- 6. RLS
-- ────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.results  enable row level security;
alter table public.groups   enable row level security;
alter table public.writings enable row level security;

-- PROFILES -------------------------------------------------------
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or public.is_teacher_of(id)
    or public.is_my_teacher(id)
  );

-- El admin puede cambiar perfiles (p. ej. asignar grupo a un alumno).
-- Crear y borrar perfiles sigue siendo cosa de la Edge Function.
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- GROUPS ---------------------------------------------------------
create policy "groups_select" on public.groups
  for select to authenticated
  using (
    (select public.is_admin())
    or teacher_id = (select auth.uid())
    or id = (select public.my_group_id())
  );

create policy "groups_insert_admin" on public.groups
  for insert to authenticated with check ((select public.is_admin()));

create policy "groups_update_admin" on public.groups
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "groups_delete_admin" on public.groups
  for delete to authenticated using ((select public.is_admin()));

-- RESULTS --------------------------------------------------------
create policy "results_select" on public.results
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
    or public.is_teacher_of(user_id)
  );

create policy "results_insert_own" on public.results
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- WRITINGS -------------------------------------------------------
-- Solo lectura desde el navegador. Escribir: submit_writing / review_writing.
create policy "writings_select" on public.writings
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or (select public.is_admin())
    or public.is_teacher_of(student_id)
  );

revoke insert, update, delete on public.writings from anon, authenticated;
revoke insert, delete         on public.profiles from anon, authenticated;
revoke all                    on public.groups   from anon;
revoke all                    on public.writings from anon;


-- ────────────────────────────────────────────────────────────
-- 7. FUNCIONES DE WRITING (las llama la web con supabase.rpc)
-- ────────────────────────────────────────────────────────────

-- El alumno envía un writing. Nivel y número de palabras los pone el servidor.
create or replace function public.submit_writing(
  p_task_type    text,
  p_prompt_id    text,
  p_prompt_title text,
  p_prompt_text  text,
  p_content      text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid     uuid := auth.uid();
  v_level   text;
  v_content text := btrim(coalesce(p_content, ''));
  v_id      uuid;
begin
  select level into v_level from public.profiles where id = v_uid and role = 'student';
  if v_level is null then
    raise exception 'Solo los alumnos pueden enviar writings.';
  end if;
  if v_content = '' then
    raise exception 'El texto está vacío.';
  end if;
  if char_length(v_content) > 20000 then
    raise exception 'El texto es demasiado largo.';
  end if;

  insert into public.writings
    (student_id, level, task_type, prompt_id, prompt_title, prompt_text, content, word_count)
  values (
    v_uid, v_level,
    left(coalesce(p_task_type, ''), 60),
    left(p_prompt_id, 80),
    left(coalesce(p_prompt_title, ''), 200),
    left(coalesce(p_prompt_text, ''), 5000),
    v_content,
    coalesce(array_length(regexp_split_to_array(v_content, '\s+'), 1), 0)
  )
  returning id into v_id;

  return v_id;
end $$;

-- La profesora (o el admin) corrige un writing: feedback + rúbrica 0-5.
-- Se puede volver a llamar para editar la corrección.
create or replace function public.review_writing(
  p_writing_id          uuid,
  p_feedback            text,
  p_score_content       integer,
  p_score_communicative integer,
  p_score_organisation  integer,
  p_score_language      integer
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_student uuid;
begin
  select student_id into v_student from public.writings where id = p_writing_id;
  if v_student is null then
    raise exception 'Writing no encontrado.';
  end if;
  if not (public.is_admin() or public.is_teacher_of(v_student)) then
    raise exception 'No puedes corregir este writing.';
  end if;
  if btrim(coalesce(p_feedback, '')) = '' then
    raise exception 'Escribe el feedback antes de guardar.';
  end if;

  update public.writings set
    feedback            = btrim(p_feedback),
    score_content       = p_score_content,
    score_communicative = p_score_communicative,
    score_organisation  = p_score_organisation,
    score_language      = p_score_language,
    status              = 'reviewed',
    reviewed_by         = auth.uid(),
    reviewed_at         = now()
  where id = p_writing_id;
end $$;

-- ────────────────────────────────────────────────────────────
-- 8. ÚLTIMO ACCESO
-- La web la llama al abrirse y al navegar. Como mucho escribe una vez
-- cada 5 minutos por usuario, para no cargar la base de datos.
-- (auth.users.last_sign_in_at no sirve: solo cambia al escribir la
-- contraseña, no cuando el alumno entra con la sesión guardada.)
-- ────────────────────────────────────────────────────────────
create or replace function public.touch_last_seen()
returns void language sql security definer set search_path = '' as $$
  update public.profiles
     set last_seen_at = now()
   where id = (select auth.uid())
     and (last_seen_at is null or last_seen_at < now() - interval '5 minutes');
$$;

-- Primera vez: partir del último login que ya conoce Supabase
update public.profiles p
   set last_seen_at = u.last_sign_in_at
  from auth.users u
 where u.id = p.id and p.last_seen_at is null and u.last_sign_in_at is not null;

revoke execute on function public.touch_last_seen() from public, anon;
grant  execute on function public.touch_last_seen() to authenticated;

-- Permisos de ejecución: solo usuarios con sesión
revoke execute on function public.submit_writing(text, text, text, text, text)                       from public, anon;
revoke execute on function public.review_writing(uuid, text, integer, integer, integer, integer)     from public, anon;
grant  execute on function public.submit_writing(text, text, text, text, text)                       to authenticated;
grant  execute on function public.review_writing(uuid, text, integer, integer, integer, integer)     to authenticated;
