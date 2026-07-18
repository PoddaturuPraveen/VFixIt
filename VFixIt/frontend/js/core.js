/* ============================================
   VFixIt – Core JS Utilities & API Client
   ============================================ */
'use strict';

const API_BASE = '/api';

// ── Storage helpers ──────────────────────────
const Store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k) => localStorage.removeItem(k),
  token: () => localStorage.getItem('vfixit_token'),
  user: () => Store.get('vfixit_user'),
  setAuth: (token, user) => { localStorage.setItem('vfixit_token', token); Store.set('vfixit_user', user); },
  clearAuth: () => { localStorage.removeItem('vfixit_token'); localStorage.removeItem('vfixit_user'); },
};

// ── API Client ────────────────────────────────
const API = {
  async req(method, path, body, authRequired = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (authRequired || Store.token()) headers['Authorization'] = `Bearer ${Store.token()}`;
    const opts = { method, headers };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw { status: res.status, message: data.message || 'Request failed', data };
    return data;
  },
  get: (path, auth) => API.req('GET', path, null, auth),
  post: (path, body, auth) => API.req('POST', path, body, auth),
  put: (path, body) => API.req('PUT', path, body),
  patch: (path, body) => API.req('PATCH', path, body),
  delete: (path) => API.req('DELETE', path),
};

// ── Auth helpers ──────────────────────────────
const Auth = {
  isLoggedIn: () => !!Store.token() && !!Store.user(),
  user: () => Store.user(),
  role: () => (Store.user() || {}).role,
  logout() {
    Store.clearAuth();
    Router.go('/');
    Toast.show('Logged out successfully', 'info');
    Navbar.render();
  },
  requireLogin(role) {
    if (!this.isLoggedIn()) { Router.go('/login'); return false; }
    if (role && this.role() !== role && this.role() !== 'admin') { Router.go('/'); return false; }
    return true;
  },
};

// ── Toast notifications ───────────────────────
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'default', duration = 3500) {
    this.init();
    const icons = { success: '✅', error: '❌', info: 'ℹ️', default: '🔔' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;
    this.container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, duration);
  },
};

// ── Form utilities ────────────────────────────
const Form = {
  validate(formEl) {
    let valid = true;
    formEl.querySelectorAll('[data-required]').forEach(el => {
      const errEl = formEl.querySelector(`#${el.id}Err`);
      if (!el.value.trim()) {
        el.classList.add('is-invalid');
        if (errEl) { errEl.textContent = el.dataset.required; errEl.classList.add('show'); }
        valid = false;
      } else {
        el.classList.remove('is-invalid');
        if (errEl) errEl.classList.remove('show');
      }
    });
    // Email
    formEl.querySelectorAll('[type=email]').forEach(el => {
      if (el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
        el.classList.add('is-invalid');
        const errEl = formEl.querySelector(`#${el.id}Err`);
        if (errEl) { errEl.textContent = 'Enter a valid email address'; errEl.classList.add('show'); }
        valid = false;
      }
    });
    return valid;
  },
  showError(inputId, msg) {
    const el = document.getElementById(inputId);
    const err = document.getElementById(inputId + 'Err');
    if (el) el.classList.add('is-invalid');
    if (err) { err.textContent = msg; err.classList.add('show'); }
  },
  clearErrors(formEl) {
    formEl.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
    formEl.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
  },
  data(formEl) {
    const fd = new FormData(formEl);
    const obj = {};
    fd.forEach((v, k) => obj[k] = v);
    return obj;
  },
  setLoading(btn, loading, originalText) {
    if (loading) {
      btn.dataset.orig = btn.innerHTML;
      btn.innerHTML = `<span class="spinner"></span> Loading…`;
      btn.disabled = true;
    } else {
      btn.innerHTML = originalText || btn.dataset.orig || 'Submit';
      btn.disabled = false;
    }
  },
};

// ── Router (SPA) ──────────────────────────────
const Router = {
  routes: {},
  current: null,
  register(path, handler) { this.routes[path] = handler; },
  go(path, push = true) {
    if (push) history.pushState({}, '', path);
    this.resolve(path);
  },
  resolve(path) {
    this.current = path;
    const cleanPath = path.split('?')[0];
    const handler = this.routes[cleanPath] || this.routes['/404'] || this.routes['/'];
    const app = document.getElementById('app');
    if (app) { app.innerHTML = ''; handler(app); }
    Navbar.render();
    window.scrollTo(0, 0);
  },
  init() {
    window.addEventListener('popstate', () => this.resolve(location.pathname));
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-route]');
      if (a) { e.preventDefault(); this.go(a.dataset.route); }
    });
    this.resolve(location.pathname);
  },
};

// ── Navbar ────────────────────────────────────
const Navbar = {
  render() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const user = Auth.user();
    const role = Auth.role();
    const p = location.pathname;

    const links = [
      { label: 'Home', path: '/' },
      { label: 'Services', path: '/services' },
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'About', path: '/about' },
    ];
    if (user) {
      if (role === 'admin') links.push({ label: 'Admin', path: '/admin' });
      if (role === 'provider') links.push({ label: 'Dashboard', path: '/provider-dashboard' });
      if (role === 'user') links.push({ label: 'Bookings', path: '/my-bookings' });
    }

    const initials = user ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '';

    nav.innerHTML = `
      <div class="navbar">
        <button class="hamburger" id="hamburgerBtn" aria-label="Menu">☰</button>
        <a class="nav-brand" data-route="/">
          <span class="icon">🔧</span> VFixIt
        </a>
        <nav class="nav-links" id="navLinks">
          ${links.map(l => `<a data-route="${l.path}" class="${p === l.path ? 'active' : ''}">${l.label}</a>`).join('')}
        </nav>
        <div class="nav-right">
          ${user ? `
            <button class="nav-notif-btn" id="notifBtn" aria-label="Notifications">
              🔔 <span class="notif-badge hidden" id="notifBadge">0</span>
            </button>
            <div class="nav-avatar" id="avatarBtn" title="${user.name}">${initials}</div>
          ` : `
            <a class="btn btn-secondary btn-sm" data-route="/login">Login</a>
            <a class="btn btn-primary btn-sm" data-route="/register">Sign Up Free</a>
          `}
        </div>
      </div>
      <div class="notif-panel" id="notifPanel"></div>
    `;

    const ham = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (ham) ham.onclick = () => navLinks.classList.toggle('open');

    // Close mobile menu on link click
    if (navLinks) {
      navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navLinks.classList.remove('open'));
      });
    }

    // Avatar dropdown
    const avatarBtn = document.getElementById('avatarBtn');
    if (avatarBtn) {
      avatarBtn.onclick = (e) => {
        e.stopPropagation();
        const existing = document.getElementById('avatarMenu');
        if (existing) { existing.remove(); return; }
        const profPath = role === 'provider' ? '/provider-dashboard' : role === 'admin' ? '/admin' : '/profile';
        const m = document.createElement('div');
        m.id = 'avatarMenu';
        m.style.cssText = `position:fixed;top:70px;right:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-lg);min-width:200px;z-index:9000;overflow:hidden;`;
        m.innerHTML = `
          <div style="padding:14px 16px;border-bottom:1px solid var(--border);">
            <div style="font-weight:700;font-size:.9rem;color:var(--text)">${user.name}</div>
            <div style="font-size:.76rem;color:var(--text-2);margin-top:2px">${user.email}</div>
            <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:20px;font-size:.7rem;font-weight:600;background:var(--primary-light);color:var(--primary)">${role}</span>
          </div>
          <div data-route="${profPath}" style="padding:11px 16px;cursor:pointer;font-size:.875rem;color:var(--text);display:flex;align-items:center;gap:10px;transition:background .15s" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background=''">👤 My Profile</div>
          ${role === 'user' ? `<div data-route="/my-bookings" style="padding:11px 16px;cursor:pointer;font-size:.875rem;color:var(--text);display:flex;align-items:center;gap:10px;transition:background .15s" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background=''">📅 My Bookings</div>` : ''}
          <div style="border-top:1px solid var(--border)"></div>
          <div id="logoutBtn" style="padding:11px 16px;cursor:pointer;font-size:.875rem;color:var(--danger);display:flex;align-items:center;gap:10px;transition:background .15s" onmouseenter="this.style.background='#fff5f5'" onmouseleave="this.style.background=''">🚪 Logout</div>
        `;
        document.body.appendChild(m);
        m.querySelectorAll('[data-route]').forEach(el => {
          el.addEventListener('click', () => { m.remove(); Router.go(el.dataset.route); });
        });
        m.querySelector('#logoutBtn').onclick = () => { m.remove(); Auth.logout(); };
        setTimeout(() => document.addEventListener('click', () => m?.remove(), { once: true }), 10);
      };
    }

    // Notifications
    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn) {
      Notifications.loadCount();
      notifBtn.onclick = (e) => { e.stopPropagation(); Notifications.toggle(); };
    }
  },
};

// ── Notifications ─────────────────────────────
const Notifications = {
  async loadCount() {
    if (!Auth.isLoggedIn()) return;
    try {
      const { unread } = await API.get('/notifications');
      const badge = document.getElementById('notifBadge');
      if (badge) { badge.textContent = unread; badge.classList.toggle('hidden', unread === 0); }
    } catch { }
  },
  async toggle() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;
    if (panel.classList.contains('open')) { panel.classList.remove('open'); return; }
    panel.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
    panel.classList.add('open');
    try {
      const { data, unread } = await API.get('/notifications');
      panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border)">
          <strong style="font-size:.9rem">Notifications ${unread > 0 ? `<span class="badge badge-danger">${unread}</span>` : ''}</strong>
          ${unread > 0 ? `<button class="btn btn-ghost btn-sm" id="markAllRead">Mark all read</button>` : ''}
        </div>
        ${data.length === 0 ? '<div class="empty-state" style="padding:30px"><div class="icon">🔔</div><p>No notifications</p></div>' :
          data.map(n => `
            <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
              <div class="notif-title">${n.title}</div>
              <div class="notif-msg">${n.message}</div>
              <div class="notif-time">${timeAgo(n.created_at)}</div>
            </div>
          `).join('')}
      `;
      const markAll = panel.querySelector('#markAllRead');
      if (markAll) markAll.onclick = async () => { await API.patch('/notifications/read-all'); this.toggle(); this.loadCount(); };
      panel.querySelectorAll('.notif-item').forEach(item => {
        item.onclick = () => API.patch(`/notifications/${item.dataset.id}/read`).then(() => { item.classList.remove('unread'); this.loadCount(); });
      });
    } catch { panel.innerHTML = '<div class="empty-state" style="padding:30px"><p>Failed to load</p></div>'; }
    document.addEventListener('click', (e) => { if (!panel.contains(e.target) && e.target.id !== 'notifBtn') panel.classList.remove('open'); }, { once: true });
  },
};

// ── Helpers ───────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';

  // SQLite returns "YYYY-MM-DD HH:MM:SS". We convert to ISO format 
  // and append 'Z' to explicitly tell the browser this is a UTC time.
  const date = new Date(dateStr.replace(' ', 'T') + 'Z');
  const diff = Date.now() - date.getTime();

  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

function stars(rating, total) {
  const full = Math.round(rating);
  const s = '★'.repeat(full) + '☆'.repeat(5 - full);
  return `<span class="stars">${s}</span> <span style="color:var(--text-2);font-size:.85rem">${rating} (${total} reviews)</span>`;
}

function statusBadge(status) {
  return `<span class="status status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'U';
}

function formatDate(d) {
  if (!d) return '';
  // Ensure strings containing time are treated as UTC for correct local conversion
  const date = new Date(d.includes(' ') ? d.replace(' ', 'T') + 'Z' : d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function el(tag, props = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  });
  children.forEach(c => c && (typeof c === 'string' ? e.insertAdjacentHTML('beforeend', c) : e.appendChild(c)));
  return e;
}

window.API = API; window.Auth = Auth; window.Store = Store; window.Toast = Toast;
window.Form = Form; window.Router = Router; window.Navbar = Navbar;
window.Notifications = Notifications;
window.timeAgo = timeAgo; window.stars = stars; window.statusBadge = statusBadge;
window.initials = initials; window.formatDate = formatDate; window.formatCurrency = formatCurrency;
window.el = el;
