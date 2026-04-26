/* ============================================
   comments.js — Core Comment Logic & Mode Toggle
   ============================================ */

let storedComments = [];   // Simulates the database
let secureMode = false;    // Tracks current rendering mode

/* ---------- Submit Comment ---------- */
function submitComment() {
  const authorInput = document.getElementById('author-input');
  const commentInput = document.getElementById('comment-input');

  const author = authorInput.value.trim() || 'Anonymous';
  const body   = commentInput.value.trim();

  if (!body) {
    commentInput.style.borderColor = 'var(--red)';
    setTimeout(() => { commentInput.style.borderColor = ''; }, 800);
    return;
  }

  // Detect if comment contains a known XSS payload
  const match = payloads.find(p => body.includes(p.code.substring(0, 15)));

  // Store comment — NO sanitization (simulating vulnerable server)
  storedComments.push({
    author: author,
    body: body,             // Raw unsanitized input saved as-is
    ts: new Date().toLocaleTimeString(),
    isPayload: !!match,
    msg: match ? match.msg : null
  });

  // Clear input
  commentInput.value = '';
  authorInput.value = '';

  // Update displays
  updateStoredDisplay();
  renderComments(false);  // Re-render without triggering XSS yet
}

/* ---------- Render Comments ---------- */
function renderComments(triggerXSS) {
  const list = document.getElementById('comment-list');
  list.innerHTML = '';
  pendingAlerts = [];

  if (storedComments.length === 0) {
    list.innerHTML = '<div class="comment-empty">No comments yet. Try submitting one!</div>';
    return;
  }

  storedComments.forEach(c => {
    const item     = document.createElement('div');
    const authorDiv = document.createElement('div');
    const bodyDiv   = document.createElement('div');

    item.className = 'comment-item';
    authorDiv.className = 'comment-author';
    bodyDiv.className = 'comment-body';

    // Author is always safe (textContent)
    authorDiv.textContent = c.author + ' · ' + c.ts;

    if (secureMode) {
      // ✅ SECURE: textContent treats everything as plain text
      bodyDiv.textContent = c.body;
      item.classList.add('safe-render');
    } else {
      // ❌ VULNERABLE: innerHTML renders HTML and executes scripts
      bodyDiv.innerHTML = c.body;
      if (c.isPayload) {
        item.classList.add('payload');
      }
    }

    item.appendChild(authorDiv);
    item.appendChild(bodyDiv);
    list.appendChild(item);

    // Queue XSS alerts for page view simulation
    if (triggerXSS && c.isPayload && c.msg && !secureMode) {
      pendingAlerts.push(c.msg);
    }
  });

  // Trigger the first alert after DOM update
  if (triggerXSS && pendingAlerts.length > 0) {
    setTimeout(() => showAlert(pendingAlerts[0]), 200);
  }
}

/* ---------- Simulate Page View ---------- */
function simulatePageLoad() {
  if (storedComments.length === 0) {
    showAlert('No comments stored yet. Submit a payload first!');
    return;
  }
  renderComments(true);  // true = trigger any XSS payloads
}

/* ---------- Toggle Vulnerable / Secure Mode ---------- */
function toggleMode() {
  secureMode = !secureMode;

  const indicator  = document.getElementById('vuln-indicator');
  const toggleTrack = document.getElementById('toggle-track');
  const toggleLabel = document.getElementById('toggle-label');

  if (secureMode) {
    indicator.textContent = '✅ textContent — SAFE';
    indicator.className   = 'vuln-badge safe';
    toggleTrack.classList.add('safe');
    toggleLabel.textContent = 'Secure Mode';
    toggleLabel.classList.add('safe');
  } else {
    indicator.textContent = '⚠️ innerHTML — VULNERABLE';
    indicator.className   = 'vuln-badge vuln';
    toggleTrack.classList.remove('safe');
    toggleLabel.textContent = 'Vulnerable Mode';
    toggleLabel.classList.remove('safe');
  }

  renderComments(false);  // Re-render under new mode
}

/* ---------- Update Stored Comments Display (sidebar) ---------- */
function updateStoredDisplay() {
  const container = document.getElementById('stored-list');
  if (!container) return;

  container.innerHTML = '';

  if (storedComments.length === 0) {
    container.innerHTML = '<div class="stored-empty">No stored comments</div>';
    return;
  }

  storedComments.forEach(c => {
    const item = document.createElement('div');
    item.className = 'stored-item' + (c.isPayload ? '' : ' safe-item');
    item.textContent = c.body;  // Always show raw text in stored display
    container.appendChild(item);
  });
}

/* ---------- Clear All Comments ---------- */
function clearComments() {
  storedComments = [];
  updateStoredDisplay();
  renderComments(false);
}
