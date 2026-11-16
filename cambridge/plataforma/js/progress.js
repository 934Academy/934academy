// ════════════════════════════════════════════════════════════
// CÁLCULOS DE PROGRESO (sin acceso a la base de datos: solo números)
// Un "resultado" es { user_id, exam, part, score, completed_at }:
//   exam = destreza ('reading'…), part = nº de parte, score = % de aciertos
// ════════════════════════════════════════════════════════════
import { totalScore } from './rubric.js';

const avg = (nums) => nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;

// Semáforo de notas (el mismo que ya usaba "Mis resultados")
export function scoreClass(pct) {
  if (pct === null || pct === undefined) return 'score-none';
  return pct >= 75 ? 'score-ok' : pct >= 50 ? 'score-mid' : 'score-low';
}

// Quedarse con lo de los últimos N días (sin N → todo)
export function since(rows, days, dateField = 'completed_at') {
  if (!days) return rows;
  const from = Date.now() - days * 86400000;
  return rows.filter(r => new Date(r[dateField]).getTime() >= from);
}

// Tendencia: media de los intentos más recientes menos la de los anteriores.
// Necesita al menos 4 intentos; compara hasta 5 contra 5.
export function trend(rowsOldestFirst) {
  const n = rowsOldestFirst.length;
  if (n < 4) return null;
  const k = Math.min(5, Math.floor(n / 2));
  const recent = rowsOldestFirst.slice(n - k).map(r => r.score);
  const before = rowsOldestFirst.slice(n - 2 * k, n - k).map(r => r.score);
  return avg(recent) - avg(before);
}

function stats(rows) {
  const sorted = [...rows].sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));
  const last   = sorted[sorted.length - 1];
  return {
    count:     rows.length,
    avg:       avg(rows.map(r => r.score)),
    best:      rows.length ? Math.max(...rows.map(r => r.score)) : null,
    lastScore: last?.score ?? null,
    lastDate:  last?.completed_at ?? null,
    trend:     trend(sorted),
  };
}

// Resumen de un alumno: global, por destreza y por parte
export function summarize(allResults) {
  // Ignorar filas incompletas (sin destreza o sin nota) para no dar NaN
  const results = allResults.filter(r => r.exam && Number.isFinite(r.score));
  const bySkill = {};
  for (const r of results) {
    const skill = (bySkill[r.exam] ||= { rows: [], parts: {} });
    skill.rows.push(r);
    (skill.parts[r.part] ||= []).push(r);
  }

  const skills = {};
  for (const [name, s] of Object.entries(bySkill)) {
    skills[name] = {
      ...stats(s.rows),
      parts: Object.fromEntries(Object.entries(s.parts).map(([p, rows]) => [p, stats(rows)])),
    };
  }
  return { ...stats(results), skills };
}

// Partes más flojas / más fuertes (mínimo 2 intentos para que cuente)
export function partsRanking(summary, minAttempts = 2) {
  const all = [];
  for (const [skill, s] of Object.entries(summary.skills)) {
    for (const [part, p] of Object.entries(s.parts)) {
      if (p.count >= minAttempts) all.push({ skill, part: Number(part), avg: p.avg, count: p.count });
    }
  }
  all.sort((a, b) => a.avg - b.avg);
  return all;
}

// Writings: enviados, corregidos, pendientes y media sobre 20
export function writingSummary(writings) {
  const reviewed = writings.filter(w => w.status === 'reviewed');
  const totals   = reviewed.map(totalScore).filter(t => t !== null);
  return {
    sent:     writings.length,
    reviewed: reviewed.length,
    pending:  writings.length - reviewed.length,
    avg20:    totals.length ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length * 10) / 10 : null,
  };
}

// Media de varias medias ignorando huecos (media del grupo = media de alumnos)
export function avgOf(values) {
  return avg(values.filter(v => v !== null && v !== undefined));
}
