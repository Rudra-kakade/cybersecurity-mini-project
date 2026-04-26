/* ============================================
   ui.js — UI Helpers: Modal, Tabs, Payload Inject
   ============================================ */

let pendingAlerts = [];

/* ---------- Custom Alert Modal ---------- */
function showAlert(msg) {
  const overlay = document.getElementById('alert-overlay');
  const msgEl   = document.getElementById('alert-msg');
  msgEl.textContent = msg;
  overlay.classList.add('show');
}

function closeAlert() {
  const overlay = document.getElementById('alert-overlay');
  overlay.classList.remove('show');

  // Process next queued alert
  pendingAlerts.shift();
  if (pendingAlerts.length > 0) {
    setTimeout(() => showAlert(pendingAlerts[0]), 300);
  }
}

/* ---------- Tab Switching ---------- */
function switchTab(tabName) {
  // Deactivate all tabs & panels
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

  // Activate selected
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`panel-${tabName}`).classList.add('active');
}

/* ---------- Inject Payload into Textarea ---------- */
function injectPayload(index) {
  const payload = payloads[index];
  if (!payload) return;

  const textarea = document.getElementById('comment-input');
  textarea.value = payload.code;
  textarea.focus();

  // Flash effect on textarea
  textarea.style.borderColor = 'var(--red)';
  textarea.style.boxShadow = '0 0 0 3px var(--red-glow)';
  setTimeout(() => {
    textarea.style.borderColor = '';
    textarea.style.boxShadow = '';
  }, 600);
}

/* ---------- Build Payload Cards in Attack Panel ---------- */
function buildPayloadPanel() {
  const list = document.getElementById('payload-list');
  if (!list) return;

  list.innerHTML = '';
  payloads.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'payload-card';
    card.onclick = () => injectPayload(i);
    card.innerHTML = `
      <div class="payload-name">⚡ ${p.name}</div>
      <div class="payload-code">${escapeHTML(p.code)}</div>
      <div class="payload-desc">${p.description}</div>
    `;
    list.appendChild(card);
  });
}

/* ---------- Utility: Escape HTML for display ---------- */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Init on DOM ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildPayloadPanel();
  renderComments(false);

  // Close modal on overlay click
  const overlay = document.getElementById('alert-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAlert();
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAlert();
  });
});
