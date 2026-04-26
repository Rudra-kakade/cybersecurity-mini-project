/* ============================================
   secure.js — Secure Rendering Utilities
   & Defense Mechanism Descriptions
   ============================================ */

/**
 * sanitizeHTML — Encodes HTML special characters
 * This is the server-side equivalent of using textContent on the client.
 * Converts < > " ' & into HTML entities so they render as text, not markup.
 */
function sanitizeHTML(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * Defense mechanisms data for the Fix panel
 */
const defenses = [
  {
    icon: '🔒',
    title: 'Output Encoding',
    desc: 'Use textContent (client) or htmlspecialchars() (PHP) to encode untrusted data before inserting into HTML.'
  },
  {
    icon: '🛡️',
    title: 'Content Security Policy',
    desc: "Add CSP headers: script-src 'self' — blocks all inline scripts including XSS payloads."
  },
  {
    icon: '🧹',
    title: 'Input Validation',
    desc: 'Reject or strip dangerous input at the server level before storing. Use allowlists, not blocklists.'
  },
  {
    icon: '🍪',
    title: 'HttpOnly Cookies',
    desc: 'Set HttpOnly flag on session cookies — JavaScript cannot read them even if XSS executes.'
  },
  {
    icon: '🧪',
    title: 'Sanitization Library',
    desc: 'For rich text, use DOMPurify to strip dangerous HTML while preserving safe formatting tags.'
  },
  {
    icon: '📋',
    title: 'Validate + Encode',
    desc: 'Apply both server-side validation (reject bad input) AND output encoding (escape everything on render).'
  }
];

/**
 * Builds the defense mechanism list in the Fix panel
 */
function buildDefenseList() {
  const container = document.getElementById('defense-list');
  if (!container) return;

  container.innerHTML = '';
  defenses.forEach(d => {
    const item = document.createElement('div');
    item.className = 'defense-item';
    item.innerHTML = `
      <div class="defense-icon">${d.icon}</div>
      <div><strong>${d.title}:</strong> ${d.desc}</div>
    `;
    container.appendChild(item);
  });
}

// Build defense list on load
document.addEventListener('DOMContentLoaded', buildDefenseList);
