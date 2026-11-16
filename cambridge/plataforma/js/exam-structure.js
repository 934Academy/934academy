// ════════════════════════════════════════════════════════════
// ESTRUCTURA DE LOS EXÁMENES: partes de cada destreza por nivel.
// La usan las páginas de práctica y los informes de progreso.
// ════════════════════════════════════════════════════════════

export const PartS = {
  C1: {
    'use-of-english': [
      { id: 'part1', num: 'Part 1', name: 'Multiple Choice Cloze', desc: 'Choose the correct word to complete the text' },
      { id: 'part2', num: 'Part 2', name: 'Open Cloze', desc: 'Complete the gaps without options' },
      { id: 'part3', num: 'Part 3', name: 'Word Formation', desc: 'Form the correct word from the root' },
      { id: 'part4', num: 'Part 4', name: 'Key Word Transformations', desc: 'Rewrite the sentence using the key word' },
    ],
    'reading': [
      { id: 'part5', num: 'Part 5', name: 'Multiple Choice', desc: 'Questions about reading comprehension with a long text' },
      { id: 'part6', num: 'Part 6', name: 'Cross-text Multiple Matching', desc: 'Match opinions across four related texts' },
      { id: 'part7', num: 'Part 7', name: 'Gapped Text', desc: 'Choose the paragraph that fits each gap' },
      { id: 'part8', num: 'Part 8', name: 'Multiple Matching', desc: 'Match questions with the correct text' },
    ],
    'listening': [
      { id: 'part1', num: 'Part 1', name: 'Multiple Choice (Short)', desc: 'Listen to 3 short extracts and answer 2 questions each' },
      { id: 'part2', num: 'Part 2', name: 'Sentence Completion',     desc: 'Listen to a monologue and complete 8 sentences' },
      { id: 'part3', num: 'Part 3', name: 'Multiple Choice (Long)',  desc: 'Listen to an interview and answer 6 multiple-choice questions' },
      { id: 'part4', num: 'Part 4', name: 'Multiple Matching',       desc: 'Listen to 5 speakers and match them to two different tasks' }
    ],
  },
  B2: {
    'use-of-english': [
      { id: 'part1', num: 'Part 1', name: 'Multiple Choice Cloze',    desc: 'Choose the correct word to complete the text' },
      { id: 'part2', num: 'Part 2', name: 'Open Cloze',               desc: 'Complete the gaps without options' },
      { id: 'part3', num: 'Part 3', name: 'Word Formation',           desc: 'Form the correct word from the root' },
      { id: 'part4', num: 'Part 4', name: 'Key Word Transformations', desc: 'Rewrite the sentence using the key word' },
    ],
    'reading': [
      { id: 'part5', num: 'Part 5', name: 'Multiple Choice',   desc: 'Questions about reading comprehension with a long text' },
      { id: 'part6', num: 'Part 6', name: 'Gapped Text',       desc: 'Choose the sentence that fits in each gap' },
      { id: 'part7', num: 'Part 7', name: 'Multiple Matching', desc: 'Match questions with sections of the text' },
    ],
    'listening': [
    { id: 'part1', num: 'Part 1', name: 'Multiple Choice',         desc: 'Listen to 8 short extracts and answer multiple-choice questions' },
    { id: 'part2', num: 'Part 2', name: 'Sentence Completion',     desc: 'Listen to a monologue and complete 10 sentences' },
    { id: 'part3', num: 'Part 3', name: 'Multiple Matching',       desc: 'Listen to 5 short related monologues and match each to an option' },
    { id: 'part4', num: 'Part 4', name: 'Multiple Choice',         desc: 'Listen to a long interview and answer 7 multiple-choice questions' }
  ]
  },
  B1: {
    'reading': [
      { id: 'part1', num: 'Part 1', name: 'Short Texts',            desc: 'Read notices and short messages and choose the correct option' },
      { id: 'part2', num: 'Part 2', name: 'Matching',               desc: 'Match people with descriptive texts' },
      { id: 'part3', num: 'Part 3', name: 'Long Text',              desc: 'Read a long text and answer comprehension questions' },
      { id: 'part4', num: 'Part 4', name: 'Gapped Text',            desc: 'Choose the sentence that fits in each gap of the text' },
      { id: 'part5', num: 'Part 5', name: 'Multiple Choice Cloze',  desc: 'Choose the correct word to complete the text' },
      { id: 'part6', num: 'Part 6', name: 'Open Cloze',             desc: 'Complete the gaps with a single word' },
    ],
    'listening': [
      { id: 'part1', num: 'Part 1', name: 'Short Recordings',       desc: 'Listen to short recordings and choose the correct image' },
      { id: 'part2', num: 'Part 2', name: 'Longer Recordings',      desc: 'Listen to longer recordings and answer questions' },
      { id: 'part3', num: 'Part 3', name: 'Conversations & Talks',  desc: 'Listen to conversations and For each question, write the correct answer in the gap.Write one or two words or a number or a date or a time' },
      { id: 'part4', num: 'Part 4', name: 'Interview', desc: 'Listen to an interview and answer questions' }
    ],
  },
};

export const SKILL_NAMES = {
  'use-of-english': 'Use of English',
  'reading':        'Reading',
  'listening':      'Listening',
  'writing':        'Writing',
};

// Orden en el que se muestran las destrezas en los informes
export const SKILL_ORDER = ['use-of-english', 'reading', 'listening', 'writing'];

// Nombre de una parte ("Part 6 · Open Cloze") según el nivel del alumno
export function partLabel(level, skill, partNum) {
  const parts = PartS[level]?.[skill] || PartS.B2?.[skill] || [];
  const p = parts.find(x => x.id === `part${partNum}`);
  return p ? `${p.num} · ${p.name}` : `Part ${partNum}`;
}
