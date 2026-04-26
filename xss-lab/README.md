# SecBlog

A single-page blog application demonstrating **Stored Cross-Site Scripting (XSS)** vulnerabilities and their defenses. Built for the Web Application Security course assignment.

---

## 🚀 Quick Start

1. **Open `index.html`** directly in your browser (no server required for the client-side demo)
2. The page loads in **Vulnerable Mode** by default (`innerHTML` rendering)
3. Use the **Attack Panel** on the right to select XSS payloads
4. Submit a comment and click **"Simulate Page View"** to trigger the stored XSS

> **Optional:** To use the PHP backend, run `php -S localhost:8080` from the `xss-lab/` directory.

---

## 📁 Project Structure

```
xss-lab/
├── index.html              # Main app — vulnerable + secure mode toggle
├── css/style.css           # Dark cybersecurity theme
├── js/
│   ├── payloads.js         # XSS payload library (4 vectors)
│   ├── comments.js         # Comment storage, rendering, mode toggle
│   ├── secure.js           # Secure utilities & defense descriptions
│   └── ui.js               # Modal, tabs, payload injection
├── server/
│   ├── config.php          # Database configuration
│   ├── db.php              # ❌ Vulnerable PHP backend (educational)
│   └── db.sqlite           # SQLite database file
├── secure/
│   ├── index.html          # Secure-only demo page
│   └── server/
│       └── db_secure.php   # ✅ Secure PHP backend with htmlspecialchars()
├── docs/
│   ├── report.md           # Lab report template
│   └── screenshots/        # Screenshots for submission
├── .env                    # Environment config
└── README.md               # This file
```

---

## 🎯 Features

- **Vulnerable Mode:** Comments rendered via `innerHTML` — XSS payloads execute
- **Secure Mode:** Comments rendered via `textContent` — payloads display as plain text
- **4 Attack Payloads:** Script tag, img onerror, SVG onload, cookie theft simulation
- **Simulate Page View:** Re-renders stored comments, triggering any injected scripts
- **Custom Alert Modal:** Styled XSS alert dialog (replaces native `alert()`)
- **Code Comparison:** Side-by-side vulnerable vs secure code in the Fix tab
- **Defense Mechanisms:** 6 documented defense strategies with explanations

---

## 🔬 How to Demonstrate the Attack

### Step 1 — Inject Payload
1. Click **"⚡ 2. Image onerror"** in the Attack Panel (most reliable via innerHTML)
2. Enter any name in the author field
3. Click **"Submit Comment"**

### Step 2 — Trigger XSS
1. Click **"Simulate Page View ↻"**
2. The custom alert modal fires — **XSS confirmed! ✓**

### Step 3 — Show the Fix
1. Toggle to **"Secure Mode"** using the header switch
2. Submit the same payload again
3. Click **"Simulate Page View"** — payload renders as harmless text

---

## 🛡️ Defense Mechanisms Covered

| Defense | Implementation |
|---------|---------------|
| Output Encoding | `textContent` (client) / `htmlspecialchars()` (PHP) |
| Content Security Policy | `script-src 'self'` header blocks inline scripts |
| Input Validation | Server-side length limits & tag stripping |
| HttpOnly Cookies | Prevents JavaScript access to session cookies |
| Sanitization Library | DOMPurify for safe rich text rendering |

---

## ⚠️ Disclaimer

This project is for **educational purposes only**. The vulnerabilities are intentional to demonstrate XSS concepts. Do not use these techniques on systems you do not own or have explicit permission to test.

---

*SecBlog — April 2026*
