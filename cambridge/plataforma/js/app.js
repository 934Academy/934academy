import { login, logout, getSession, createStudent, getAllProfiles, deleteStudent, getResults } from './auth.js';
import { navigate, getCurrentPage } from './router.js';
import { initSidebar, setUserUI, showToast, closeSidebar } from './ui.js';

// Runners
import { initMultipleChoice }          from './runners/multiple-choice.js';
import { initOpenCloze }               from './runners/open-cloze.js';
import { initWordFormation }           from './runners/word-formation.js';
import { initKeyWord }                 from './runners/key-word.js';
import { initReadingMultipleChoice }   from './runners/reading-multiple-choice.js';
import { initReadingB1Part1 }          from './runners/readinb_b1_part1.js';
import { initReadingOpenCloze }         from './runners/reading_b1_part6.js';
import { initReadingB1Part5 }          from './runners/reading_b1_part5.js';
import { initReadingGappedText }       from './runners/reading-gapped-text.js';
import { initReadingMultipleMatching } from './runners/reading-multiple-matching.js';
import { initReadingMatching }         from './runners/reading-matching.js';
import { initReadingGappedSentences }  from './runners/reading-gapped-sentences.js';
import { initWriting }                 from './runners/writing.js';
import { initListeningB1Part1 }        from './runners/listening_b1_p1.js';
import { initListeningB1Part2 }        from './runners/listening_b1_p2.js';
import { initListeningB1Part3 }        from './runners/listening_b1_p3.js';
import { initListeningB1Part4 } from './runners/listening_b1_p4.js';
import { initListeningB2Part1 }        from './runners/listening_b2_p1.js';
import { initListeningB2Part2 }        from './runners/listening_b2_p2.js';
import { initListeningB2Part3 }        from './runners/listening_b2_p3.js';
import { initListeningB2Part4 }        from './runners/listening_b2_p4.js';

// Datos B2
import { EXERCISES_B2_UOE_P1 }     from './data/B2/use-of-english/part1.js';
import { EXERCISES_B2_UOE_P2 }     from './data/B2/use-of-english/part2.js';
import { EXERCISES_B2_UOE_P3 }     from './data/B2/use-of-english/part3.js';
import { EXERCISES_B2_UOE_P4 }     from './data/B2/use-of-english/part4.js';
import { EXERCISES_B2_READING_P5 } from './data/B2/reading/part5.js';
import { EXERCISES_B2_READING_P6 } from './data/B2/reading/part6.js';
import { EXERCISES_B2_READING_P7 } from './data/B2/reading/part7.js';
import { WRITING_PROMPTS_B2 }       from './data/B2/writing/prompts.js';
import { EXERCISES_B2_LISTENING_P1 } from './data/B2/listening/part1.js';
import { EXERCISES_B2_LISTENING_P2 } from './data/B2/listening/part2.js';
import { EXERCISES_B2_LISTENING_P3 } from './data/B2/listening/part3.js';
import { EXERCISES_B2_LISTENING_P4 } from './data/B2/listening/part4.js';

// Datos B1
import { EXERCISES_B1_READING_P1 } from './data/B1/reading/part1.js';
import { EXERCISES_B1_READING_P2 } from './data/B1/reading/part2.js';
import { EXERCISES_B1_READING_P3 } from './data/B1/reading/part3.js';
import { EXERCISES_B1_READING_P4 } from './data/B1/reading/part4.js';
import { EXERCISES_B1_READING_P5 } from './data/B1/reading/part5.js';
import { EXERCISES_B1_READING_P6 } from './data/B1/reading/part6.js';
import { WRITING_PROMPTS_B1 }       from './data/B1/writing/prompts.js';
import { EXERCISES_B1_LISTENING_P1 } from './data/B1/listening/part1.js';
import { EXERCISES_B1_LISTENING_P2 } from './data/B1/listening/part2.js';
import { EXERCISES_B1_LISTENING_P3 } from './data/B1/listening/part3.js';
import { EXERCISES_B1_LISTENING_P4 } from './data/B1/listening/part4.js';

const DATA = {
  B2: {
    'use-of-english': {
      part1: EXERCISES_B2_UOE_P1,
      part2: EXERCISES_B2_UOE_P2,
      part3: EXERCISES_B2_UOE_P3,
      part4: EXERCISES_B2_UOE_P4,
    },
    'reading': {
      part5: EXERCISES_B2_READING_P5,
      part6: EXERCISES_B2_READING_P6,
      part7: EXERCISES_B2_READING_P7,
    },
    'writing': { prompts: WRITING_PROMPTS_B2 },
    'listening': {
      part1: EXERCISES_B2_LISTENING_P1,
      part2: EXERCISES_B2_LISTENING_P2,
      part3: EXERCISES_B2_LISTENING_P3,
      part4: EXERCISES_B2_LISTENING_P4
    }
  },
  B1: {
    'reading': {
      part1: EXERCISES_B1_READING_P1,
      part2: EXERCISES_B1_READING_P2,
      part3: EXERCISES_B1_READING_P3,
      part4: EXERCISES_B1_READING_P4,
      part5: EXERCISES_B1_READING_P5,
      part6: EXERCISES_B1_READING_P6,
    },
    'writing': { prompts: WRITING_PROMPTS_B1 },
    'listening': {
      part1: EXERCISES_B1_LISTENING_P1,
      part2: EXERCISES_B1_LISTENING_P2,
      part3: EXERCISES_B1_LISTENING_P3,
      part4: EXERCISES_B1_LISTENING_P4
    }
  },
  
};

let currentUser = null;

// ════════════════════════════════════════════════════════════
// ARRANQUE
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  initSidebar();
  const session = await getSession();
  if (session) {
    currentUser = session;
    showApp();
  }
});

// ════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  const errorEl  = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  errorEl.classList.remove('visible');
  btn.disabled    = true;
  btn.textContent = 'Entrando...';

  try {
    currentUser = await login(username, password);
    showApp();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('visible');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Entrar';
  }
});

// ════════════════════════════════════════════════════════════
// MOSTRAR APP TRAS LOGIN
// ════════════════════════════════════════════════════════════
function showApp() {
  document.getElementById('page-login').style.display = 'none';
  document.getElementById('app').style.display        = 'flex';

  setUserUI(currentUser);
  updateSidebarForLevel();

  if (currentUser.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    renderAdmin();
    navigate('admin');
  } else {
    renderDashboard();
    navigate('dashboard');
  }
}

// ════════════════════════════════════════════════════════════
// SIDEBAR SEGÚN NIVEL
// ════════════════════════════════════════════════════════════
function updateSidebarForLevel() {
  const isB1    = currentUser?.level === 'B1';
  const uoeItem = document.querySelector('.nav-item[data-skill="use-of-english"]');
  if (uoeItem) {
    uoeItem.style.display = isB1 ? 'none' : '';
  }
}

// ════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════
document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await logout();
  window.location.reload();
});

// ════════════════════════════════════════════════════════════
// NAVEGACIÓN (clics en el sidebar)
// ════════════════════════════════════════════════════════════
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    if (item.dataset.page === 'admin' && currentUser?.role !== 'admin') return;
    navigate(item.dataset.page, { skill: item.dataset.skill });
    closeSidebar();
  });
});

// ════════════════════════════════════════════════════════════
// NAVEGACIÓN DINÁMICA
// ════════════════════════════════════════════════════════════
document.addEventListener('navigate', async ({ detail }) => {
  const { pageId, params } = detail;

  if (pageId === 'dashboard')  renderDashboard();
  if (pageId === 'destreza')   renderDestreza(params);
  if (pageId === 'admin')      await renderAdmin();
  if (pageId === 'ejercicio')  launchExercise(params);
  if (pageId === 'resultados') await renderResultados();
});

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
function renderDashboard() {
  const isB1 = currentUser?.level === 'B1';

  const skills = [
    { id: 'reading',        icon: '📖', name: 'Reading',        desc: 'Reading comprehension',                 available: true  },
    { id: 'writing',        icon: '📝', name: 'Writing',        desc: 'Writing production',                  available: true  },
    { id: 'listening',      icon: '🎧', name: 'Listening',      desc: 'Listening comprehension',                available: true },
  ];

  const grid = document.getElementById('skill-grid');
  if (!grid) return;

  grid.innerHTML = skills.map(s => `
    <div class="skill-card ${s.available ? '' : 'disabled'}"
         ${s.available ? `onclick="navigate('destreza', {skill:'${s.id}'})"` : ''}>
      <div class="skill-icon">${s.icon}</div>
      <div class="skill-name">${s.name}</div>
      <div class="skill-desc">${s.desc}</div>
      ${s.available
        ? `<div class="skill-arrow">Start →</div>`
        : `<span class="badge badge-soon">Próximamente</span>`}
    </div>
  `).join('');

  document.getElementById('stat-level').textContent = currentUser.level;
  document.getElementById('stat-name').textContent  = currentUser.full_name;
}

// ════════════════════════════════════════════════════════════
// DESTREZA
// ════════════════════════════════════════════════════════════
const PartS = {
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

const SKILL_NAMES = {
  'use-of-english': 'Use of English',
  'reading':        'Reading',
  'listening':      'Listening',
  'writing':        'Writing',
};

function renderDestreza(params = {}) {
  const skill = params.skill || 'use-of-english';
  const level = currentUser?.level || 'B2';

  document.getElementById('destreza-title').textContent    = SKILL_NAMES[skill] || skill;
  document.getElementById('destreza-subtitle').textContent = 'Select a part to practice';

  const content = document.getElementById('destreza-content');
  if (!content) return;

  if (skill === 'writing') {
    content.innerHTML = `
      <div class="skill-grid">
        <div class="skill-card" onclick="navigate('ejercicio', {skill:'writing'})">
          <div class="skill-icon">📝</div>
          <div class="skill-name">Writing Practice</div>
          <div class="skill-desc">Essay, Article, Review, Report, Letter & Email</div>
          <div class="skill-arrow">Start →</div>
        </div>
      </div>
    `;
    return;
  }
  

  const Parts = PartS[level]?.[skill] || PartS['B2']?.[skill] || [];

  content.innerHTML = `
    <div class="skill-grid">
      ${Parts.map(p => `
        <div class="skill-card" onclick="navigate('ejercicio', {skill:'${skill}', part:'${p.id}'})">
          <div class="skill-icon">📝</div>
          <div class="skill-name">${p.num}: ${p.name}</div>
          <div class="skill-desc">${p.desc}</div>
          <div class="skill-arrow">Practice →</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ════════════════════════════════════════════════════════════
// LANZAR EJERCICIO
// ════════════════════════════════════════════════════════════
function launchExercise(params = {}) {
  const level = currentUser.level;
  const skill = params.skill;
  const part  = params.part;

  if (skill === 'writing') {
    const prompts = DATA[level]?.['writing']?.prompts || DATA['B2']?.['writing']?.prompts;
    if (!prompts) return;
    initWriting(prompts, skill, part);
    return;
  }

  const exercises = DATA[level]?.[skill]?.[part];

  if (!exercises || exercises.length === 0) {
    document.getElementById('ejercicio-content').innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Sin ejercicios disponibles</h1>
        <p class="page-subtitle">Próximamente para el nivel ${level}</p>
      </div>
    `;
    return;
  }

  // ── B2 Use of English ──
  if (level === 'B2' && skill === 'use-of-english') {
    if (part === 'part1') initMultipleChoice(exercises, skill, part);
    if (part === 'part2') initOpenCloze(exercises, skill, part);
    if (part === 'part3') initWordFormation(exercises, skill, part);
    if (part === 'part4') initKeyWord(exercises, skill, part);
    return;
  }

  // ── B2 Reading ──
  if (level === 'B2' && skill === 'reading') {
    if (part === 'part5') initReadingMultipleChoice(exercises, skill, part);
    if (part === 'part6') initReadingGappedText(exercises, skill, part);
    if (part === 'part7') initReadingMultipleMatching(exercises, skill, part);
    return;
  } 

   // ── B2 Listening ──
  if (level === 'B2' && skill === 'listening') {
    if (part === 'part1') initListeningB2Part1(exercises, skill, part);
    if (part === 'part2') initListeningB2Part2(exercises, skill, part);
    if (part === 'part3') initListeningB2Part3(exercises, skill, part);
    if (part === 'part4') initListeningB2Part4(exercises, skill, part);

    return;
  }

  // ── B1 Reading ──
  if (level === 'B1' && skill === 'reading') {
    if (part === 'part1') initReadingB1Part1(exercises, skill, part);
    if (part === 'part2') initReadingMatching(exercises, skill, part);
    if (part === 'part3') initReadingMultipleChoice(exercises, skill, part);
    if (part === 'part4') initReadingGappedSentences(exercises, skill, part);
    if (part === 'part5') initReadingB1Part5(exercises, skill, part);
    if (part === 'part6') initReadingOpenCloze(exercises, skill, part);
    return;
  }

  // ── B1 Listening ──
  if (level === 'B1' && skill === 'listening') {
    if (part === 'part1') initListeningB1Part1(exercises, skill, part);
    if (part === 'part2') initListeningB1Part2(exercises, skill, part);
    if (part === 'part3') initListeningB1Part3(exercises, skill, part);
    if (part === 'part4') initListeningB1Part4(exercises, skill, part);
    return;
  }
}

// ════════════════════════════════════════════════════════════
// RESULTADOS
// ════════════════════════════════════════════════════════════
async function renderResultados() {
  const content = document.getElementById('resultados-content');
  content.innerHTML = `<p style="color:var(--color-text-muted)">Cargando...</p>`;

  const PART_NAMES = {
    1: 'Part 1',
    2: 'Part 2',
    3: 'Part 3',
    4: 'Part 4',
    5: 'Part 5',
    6: 'Part 6',
    7: 'Part 7',
  };

  try {
    const results = await getResults();

    if (results.length === 0) {
      content.innerHTML = `
        <div class="card" style="text-align:center;padding:3rem;color:var(--color-text-muted)">
          Todavía no has completado ningún ejercicio.
        </div>`;
      return;
    }

    content.innerHTML = `
      <div style="overflow-x:auto">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Exam</th>
              <th>Part</th>
              <th>Exercise</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => {
              const date  = new Date(r.completed_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
              const color = r.score >= 75 ? '#22c55e' : r.score >= 50 ? '#f59e0b' : '#ef4444';
              return `
                <tr>
                  <td style="color:var(--color-text-muted);font-size:0.85rem">${date}</td>
                  <td>${r.exam}</td>
                  <td>${PART_NAMES[r.part] || 'Part ' + r.part}</td>
                  <td>${r.exercise_id}</td>
                  <td><span style="color:${color};font-weight:700">${r.score}%</span></td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    content.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

// ════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════
async function renderAdmin() {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;

  try {
    const students = await getAllProfiles();
    tbody.innerHTML = students.map(s => `
      <tr>
        <td><code>${s.username}</code></td>
        <td>${s.full_name}</td>
        <td><span class="badge badge-level">${s.level}</span></td>
        <td><span class="badge badge-${s.role}">${s.role === 'admin' ? 'Admin' : 'Alumno'}</span></td>
        <td>
          ${s.id !== currentUser.id
            ? `<button class="btn btn-danger" style="padding:4px 12px;font-size:0.75rem"
                onclick="handleDeleteStudent('${s.id}', '${s.full_name}')">Eliminar</button>`
            : '<span style="font-size:0.75rem;color:#aaa">Tú</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.getElementById('add-student-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled    = true;
  btn.textContent = 'Guardando...';

  try {
    await createStudent({
      username: document.getElementById('new-username').value,
      fullName: document.getElementById('new-name').value,
      password: document.getElementById('new-password').value,
      level:    document.getElementById('new-level').value,
    });
    showToast('Alumno añadido correctamente');
    e.target.reset();
    await renderAdmin();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Añadir alumno';
  }
});

window.handleDeleteStudent = async (userId, name) => {
  if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
  try {
    await deleteStudent(userId);
    showToast('Alumno eliminado');
    await renderAdmin();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.navigate = navigate;