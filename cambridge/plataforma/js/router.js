let currentPage = null;

export function navigate(pageId, params = {}) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (!page) { console.warn('Página no encontrada:', pageId); return; }
  page.classList.add('active');
  currentPage = pageId;

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  updateBreadcrumb(pageId, params);
  window.scrollTo(0, 0);
  document.dispatchEvent(new CustomEvent('navigate', { detail: { pageId, params } }));
}

function updateBreadcrumb(pageId, params) {
  const SKILL_NAMES = {
    'use-of-english': 'Use of English',
    'reading':        'Reading',
    'writing':        'Writing',
    'listening':      'Listening',
    'speaking':       'Speaking',
  };

  const labels = {
    dashboard:  ['Inicio'],
    destreza:   ['Inicio', SKILL_NAMES[params.skill] || params.skill || 'Destreza'],
    ejercicio:  ['Inicio', SKILL_NAMES[params.skill] || params.skill || 'Destreza', params.part || 'Ejercicio'],
    resultados: ['Inicio', 'Mis resultados'],
    admin:      ['Inicio', 'Gestión de alumnos'],
  };

  const crumbs = labels[pageId] || ['Inicio'];
  const bc = document.getElementById('breadcrumb');
  if (!bc) return;

  bc.innerHTML = crumbs.map((label, i) => {
    const isLast = i === crumbs.length - 1;
    if (isLast) return `<span class="current">${label}</span>`;
    return `<span>${label}</span><span class="sep">›</span>`;
  }).join('');
}

export function getCurrentPage() { return currentPage; }