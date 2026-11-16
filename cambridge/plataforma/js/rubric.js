// Rúbrica de writing de Cambridge: 4 criterios de 0 a 5 (total sobre 20)
export const RUBRIC = [
  { key: 'score_content',       label: 'Content',                   desc: 'Answers the prompt, covers all points, relevant and well developed.' },
  { key: 'score_communicative', label: 'Communicative Achievement', desc: 'Appropriate register, effect on the reader, suits the text type.' },
  { key: 'score_organisation',  label: 'Organisation',              desc: 'Clear structure, paragraphs, linking devices.' },
  { key: 'score_language',      label: 'Language',                  desc: 'Range and accuracy of vocabulary and grammar.' },
];

// Suma de la rúbrica (sobre 20) o null si no está puntuado
export function totalScore(w) {
  const scores = RUBRIC.map(r => w[r.key]).filter(v => v !== null && v !== undefined);
  return scores.length ? scores.reduce((a, b) => a + b, 0) : null;
}
