// ════════════════════════════════════════════════════════════
// WRITINGS — envío del alumno y corrección de la profesora.
// Escribir solo se puede con las funciones submit_writing / review_writing
// de la base de datos; leer lo filtra la RLS (cada uno ve lo suyo).
// ════════════════════════════════════════════════════════════
import { supabase } from './supabase.js';

const LIST_FIELDS = 'id, student_id, level, task_type, prompt_title, word_count, status, submitted_at, reviewed_at, ' +
                    'score_content, score_communicative, score_organisation, score_language';

export { RUBRIC, totalScore } from './rubric.js';

// ─────────────────────────────────────────────
// ALUMNO: enviar writing
// ─────────────────────────────────────────────
export async function submitWriting({ taskType, promptId, promptTitle, promptText, content }) {
  const { data, error } = await supabase.rpc('submit_writing', {
    p_task_type:    taskType,
    p_prompt_id:    promptId,
    p_prompt_title: promptTitle,
    p_prompt_text:  promptText,
    p_content:      content,
  });
  if (error) throw new Error(error.message);
  return data; // id del writing
}

// ─────────────────────────────────────────────
// LISTADOS (sin el texto completo, para que carguen rápido)
// ─────────────────────────────────────────────
export async function listWritings({ status, studentIds } = {}) {
  let q = supabase.from('writings').select(LIST_FIELDS).order('submitted_at', { ascending: false });
  if (status)     q = q.eq('status', status);
  if (studentIds) q = q.in('student_id', studentIds);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

// Nº de writings pendientes de corregir que ve el usuario actual
export async function countPendingWritings() {
  const { count, error } = await supabase
    .from('writings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted');
  if (error) return 0;
  return count ?? 0;
}

// ─────────────────────────────────────────────
// DETALLE (texto + corrección)
// ─────────────────────────────────────────────
export async function getWriting(id) {
  const { data, error } = await supabase.from('writings').select('*').eq('id', id).single();
  if (error) throw new Error('No se ha encontrado el writing.');
  return data;
}

// ─────────────────────────────────────────────
// PROFESORA: guardar corrección
// ─────────────────────────────────────────────
export async function reviewWriting(id, { feedback, scores, annotations = [] }) {
  const { error } = await supabase.rpc('review_writing', {
    p_writing_id:          id,
    p_feedback:            feedback,
    p_score_content:       scores.score_content,
    p_score_communicative: scores.score_communicative,
    p_score_organisation:  scores.score_organisation,
    p_score_language:      scores.score_language,
    p_annotations:         annotations,
  });
  if (error) throw new Error(error.message);
}
