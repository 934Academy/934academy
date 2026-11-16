// ════════════════════════════════════════════════════════════
// GRUPOS — la RLS decide qué ve cada uno:
//   admin → todos · profesora → los suyos · alumno → el suyo
// ════════════════════════════════════════════════════════════
import { supabase } from './supabase.js';

export async function getGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, level, teacher_id')
    .order('name');
  if (error) throw new Error(error.message);
  return data;
}

// Solo admin
export async function createGroup({ name, level, teacherId }) {
  const { error } = await supabase.from('groups').insert({
    name:       name.trim(),
    level:      level || null,
    teacher_id: teacherId || null,
  });
  if (error) throw new Error(error.message);
}

// Solo admin
export async function setGroupTeacher(groupId, teacherId) {
  const { error } = await supabase
    .from('groups')
    .update({ teacher_id: teacherId || null })
    .eq('id', groupId);
  if (error) throw new Error(error.message);
}

// Solo admin. Los alumnos del grupo se quedan sin grupo (no se borran).
export async function deleteGroup(groupId) {
  const { error } = await supabase.from('groups').delete().eq('id', groupId);
  if (error) throw new Error(error.message);
}
