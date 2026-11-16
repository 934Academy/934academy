import { login, logout, getSession, touchLastSeen } from './auth.js';
import { renderProgress, renderStudentReport } from './views/progress-view.js';
import { navigate } from './router.js';
import { initSidebar, setUserUI, closeSidebar, escapeHtml, formatDate } from './ui.js';
import { renderMyWritings, renderWritingsList, renderWritingDetail, refreshPendingBadge } from './views/writings-view.js';
import { renderGroups, renderUsers, setAdminUser } from './views/admin-view.js';
import { PartS, SKILL_NAMES } from './exam-structure.js';

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
import { initMultipleChoiceC1 } from './runners/multiple-choice-c1.js';
import { initOpenClozeC1 } from './runners/open-cloze-c1.js';
import { initWordFormationC1 } from './runners/word-formation-c1.js';
import { initKeyWordC1 } from './runners/key-word-c1.js';
import { initReadingC1Part5 } from './runners/reading_c1_part5.js';
import { initReadingC1Part6 } from './runners/reading_c1_part6.js';
import { initReadingC1Part7 } from './runners/reading_c1_part7.js';
import { initReadingC1Part8 } from './runners/reading_c1_part8.js'
import { initListeningC1Part1 } from './runners/listening_c1_p1.js';
import { initListeningC1Part2 } from './runners/listening_c1_p2.js';
import { initListeningC1Part3 } from './runners/listening_c1_p3.js';
import { initListeningC1Part4 } from './runners/listening_c1_p4.js';



// Datos C1
import { EXERCISES_C1_READING_UOE_P1 } from './data/C1/uoe/part1.js';
import { EXERCISES_C1_READING_UOE_P2 } from './data/C1/uoe/part2.js';
import { EXERCISES_C1_READING_UOE_P3 } from './data/C1/uoe/part3.js';
import { EXERCISES_C1_READING_UOE_P4 } from './data/C1/uoe/part4.js';
import { EXERCISES_C1_READING_P5 } from './data/C1/reading/part5.js';
import { EXERCISES_C1_READING_P6 } from './data/C1/reading/part6.js';
import { EXERCISES_C1_READING_P7 } from './data/C1/reading/part7.js';
import { EXERCISES_C1_READING_P8 } from './data/C1/reading/part8.js';
import { WRITING_PROMPTS_C1 }       from './data/C1/writing/prompts.js';
import { EXERCISES_C1_LISTENING_P1 } from './data/C1/listening/part1.js';
import { EXERCISES_C1_LISTENING_P2 } from './data/C1/listening/part2.js';
import { EXERCISES_C1_LISTENING_P3 } from './data/C1/listening/part3.js';
import { EXERCISES_C1_LISTENING_P4 } from './data/C1/listening/part4.js';


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
  C1: {
  'use-of-english': {
    part1: EXERCISES_C1_READING_UOE_P1,
    part2: EXERCISES_C1_READING_UOE_P2,
    part3: EXERCISES_C1_READING_UOE_P3,
    part4: EXERCISES_C1_READING_UOE_P4,
  },
  'reading': {
    part5: EXERCISES_C1_READING_P5,
    part6: EXERCISES_C1_READING_P6,
    part7: EXERCISES_C1_READING_P7,
    part8: EXERCISES_C1_READING_P8,
  },
  'writing': { prompts: WRITING_PROMPTS_C1 },
  'listening': {
    part1: EXERCISES_C1_LISTENING_P1,
    part2: EXERCISES_C1_LISTENING_P2,
    part3: EXERCISES_C1_LISTENING_P3,
    part4: EXERCISES_C1_LISTENING_P4,
  }
},
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
  setAdminUser(currentUser);
  updateSidebarForLevel();

  // navigate() dispara el evento 'navigate', que ya pinta la página
  const role = currentUser.role;
  if (role === 'teacher' || role === 'admin') refreshPendingBadge();
  navigate({ admin: 'admin', teacher: 'writings' }[role] || 'dashboard');
}

// Páginas a las que puede entrar cada rol (las demás son para todos)
const PAGE_ROLES = {
  admin:          ['admin'],
  grupos:         ['teacher', 'admin'],
  writings:       ['teacher', 'admin'],
  progreso:       ['teacher', 'admin'],
  alumno:         ['teacher', 'admin'],
  resultados:     ['student'],
  'mis-writings': ['student'],
};
const canOpen = (pageId) => !PAGE_ROLES[pageId] || PAGE_ROLES[pageId].includes(currentUser?.role);

// ════════════════════════════════════════════════════════════
// SIDEBAR SEGÚN NIVEL
// ════════════════════════════════════════════════════════════
function updateSidebarForLevel() {
  const isB1 = currentUser?.level === 'B1';
  const uoeItem = document.querySelector('.nav-item[data-skill="use-of-english"]');
  if (uoeItem) {
    // Si es B1, lo ocultamos. Si es B2 o C1, lo mostramos.
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
    if (!canOpen(item.dataset.page)) return;
    navigate(item.dataset.page, { skill: item.dataset.skill });
    closeSidebar();
  });
});

// ════════════════════════════════════════════════════════════
// NAVEGACIÓN DINÁMICA
// ════════════════════════════════════════════════════════════
document.addEventListener('navigate', async ({ detail }) => {
  const { pageId, params } = detail;
  if (!currentUser || !canOpen(pageId)) return;
  touchLastSeen();

  if (pageId === 'dashboard')    renderDashboard();
  if (pageId === 'destreza')     renderDestreza(params);
  if (pageId === 'admin')        await renderUsers();
  if (pageId === 'grupos')       await renderGroups();
  if (pageId === 'ejercicio')    launchExercise(params);
  if (pageId === 'resultados')   await renderStudentReport({ studentId: currentUser.id, currentUser, containerId: 'resultados-content' });
  if (pageId === 'progreso')     await renderProgress(params);
  if (pageId === 'alumno')       await renderStudentReport({ studentId: params.id, currentUser, containerId: 'alumno-content', backTo: params.from });
  if (pageId === 'mis-writings') await renderMyWritings();
  if (pageId === 'writings')     await renderWritingsList(params);
  if (pageId === 'writing')      await renderWritingDetail(params, currentUser);
});

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
function renderDashboard() {
  const isB1 = currentUser?.level === 'B1';

  // Creamos el array de destrezas vacío para armarlo dinámicamente
  const skills = [];

  // Si NO es B1 (es decir, es B2 o C1), añadimos la tarjeta de Use of English al inicio
  if (!isB1) {
    skills.push({ id: 'use-of-english', icon: '🔤', name: 'Use of English', desc: 'Grammar and vocabulary practice', available: true });
  }

  // Añadimos el resto de las destrezas comunes para todos los niveles
  skills.push(
    { id: 'reading',        icon: '📖', name: 'Reading',        desc: 'Reading comprehension',                 available: true  },
    { id: 'writing',        icon: '📝', name: 'Writing',        desc: 'Writing production',                  available: true  },
    { id: 'listening',      icon: '🎧', name: 'Listening',      desc: 'Listening comprehension',                available: true }
  );

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

  document.getElementById('stat-level').textContent = currentUser.level || '—';
  document.getElementById('stat-name').textContent  = currentUser.full_name;
}

// ════════════════════════════════════════════════════════════
// DESTREZA
// ════════════════════════════════════════════════════════════
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
  // El admin no tiene nivel: igual que en renderDestreza, usamos B2
  const level = currentUser?.level || 'B2';
  const skill = params.skill;
  const part  = params.part;

  if (skill === 'writing') {
    const prompts = DATA[level]?.['writing']?.prompts || DATA['B2']?.['writing']?.prompts;
    if (!prompts) return;
    initWriting(prompts, skill, part, level, {
      canSubmit:   currentUser?.role === 'student',
      onSubmitted: () => navigate('mis-writings'),
    });
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
  
  // ── C1 Use of English ──
  if (level === 'C1' && skill === 'use-of-english') {
    if (part === 'part1') initMultipleChoiceC1(exercises, skill, part);
    if (part === 'part2') initOpenClozeC1(exercises, skill, part);
    if (part === 'part3') initWordFormationC1(exercises, skill, part);
    if (part === 'part4') initKeyWordC1(exercises, skill, part);
    return;
  }
   if (level === 'C1' && skill === 'reading') {
    if (part === 'part5') initReadingC1Part5(exercises, skill, part);
    if (part === 'part6') initReadingC1Part6(exercises, skill, part);
    if (part === 'part7') initReadingC1Part7(exercises, skill, part);
    if (part === 'part8') initReadingC1Part8(exercises, skill, part);
    return;
  } 
  // ── C1 Listening ──
  if (level === 'C1' && skill === 'listening') {
    if (part === 'part1') initListeningC1Part1(exercises, skill, part);
    if (part === 'part2') initListeningC1Part2(exercises, skill, part);
    if (part === 'part3') initListeningC1Part3(exercises, skill, part);
    if (part === 'part4') initListeningC1Part4(exercises, skill, part);
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
window.navigate = navigate;