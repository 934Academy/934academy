// ════════════════════════════════════════════════════════════
// UI — Sidebar, topbar, utilidades de interfaz
// ════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// Sidebar móvil
// ─────────────────────────────────────────────
export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuBtn = document.getElementById('menu-btn');

  menuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay?.addEventListener('click', closeSidebar);
}

export function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

// ─────────────────────────────────────────────
// Rellenar datos del usuario en la sidebar
// ─────────────────────────────────────────────
export function setUserUI(profile) {
  const initial = (profile.full_name || profile.username || '?').charAt(0).toUpperCase();

  const avatar  = document.getElementById('user-avatar');
  const name    = document.getElementById('user-name');
  const level   = document.getElementById('user-level');
  const greeting = document.getElementById('dash-greeting');

  if (avatar)   avatar.textContent  = initial;
  if (name)     name.textContent    = profile.full_name || profile.username;
  if (level)    level.textContent   = profile.role === 'admin' ? 'Administrador' : `Nivel ${profile.level}`;
  if (greeting) greeting.textContent = (profile.full_name || profile.username).split(' ')[0];

  // Mostrar sección admin en el nav si es admin
  if (profile.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
  }
}

// ─────────────────────────────────────────────
// Toast de notificación
// ─────────────────────────────────────────────
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    padding: 12px 20px; border-radius: 8px; font-size: 0.875rem; font-weight: 600;
    background: ${type === 'success' ? '#388e3c' : '#c62828'}; color: #fff;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    animation: slideIn 0.2s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
