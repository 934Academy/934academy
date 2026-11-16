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
  const greetingName = document.getElementById('dash-greeting-name');
  const firstName = (profile.full_name || profile.username).split(' ')[0];

  if (avatar)   avatar.textContent  = initial;
  if (name)     name.textContent    = profile.full_name || profile.username;
  if (level)    level.textContent   = ROLE_LABELS[profile.role] || `Nivel ${profile.level}`;
  if (greeting) greeting.textContent = firstName;
  if (greetingName) greetingName.textContent = firstName;

  // El CSS muestra/oculta .role-student, .role-staff y .admin-only según esto
  document.body.dataset.role = profile.role;
}

const ROLE_LABELS = { admin: 'Administración', teacher: 'Teacher' };

// Último acceso como etiqueta de color: verde ≤2 días, naranja ≤7, rojo más o nunca
export function lastSeenBadge(value) {
  if (!value) return '<span class="seen seen-old" title="Nunca ha entrado">Nunca</span>';

  const date = new Date(value);
  const days = Math.floor((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  const text = days <= 0 ? 'Hoy'
             : days === 1 ? 'Ayer'
             : days < 30 ? `Hace ${days} días`
             : formatDate(date);
  const cls  = days <= 2 ? 'seen-ok' : days <= 7 ? 'seen-warn' : 'seen-old';
  const full = date.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
  return `<span class="seen ${cls}" title="Último acceso: ${full}">${text}</span>`;
}

function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

// Fecha corta en español: "16 nov 2026"
export function formatDate(value) {
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─────────────────────────────────────────────
// Escapar texto antes de meterlo en innerHTML
// ─────────────────────────────────────────────
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
