# Stored XSS Lab Report

**Course:** Web Application Security
**Topic:** Cross-Site Scripting — Stored Attack
**Student Name:** _______________
**Date:** April 2026

---

## 1. Objective

Implement a stored XSS vulnerability in a blog comment system that calls `alert()` when the post is viewed, and demonstrate the secure fix.

---

## 2. Tools & Environment

- **Browser:** Chrome / Firefox / Edge (latest)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend (optional):** PHP 8.x with SQLite via PDO
- **OS:** Windows 11

---

## 3. Attack Demonstration

### 3.1 Payload Used

```html
<img src=x onerror="alert('Stored XSS')">
```

**Vector:** Event handler injection via broken image tag
**Why it works:** The browser attempts to load `src=x` (fails), triggering the `onerror` JavaScript event. This bypasses filters that only block `<script>` tags.

### 3.2 Steps Performed

1. Opened `index.html` in Vulnerable Mode (`innerHTML` rendering active)
2. Navigated to the comment section
3. Selected the **Image onerror** payload from the Attack Panel
4. Entered name "attacker" and submitted the comment
5. Clicked **"Simulate Page View ↻"** to simulate a visitor loading the page
6. Observed the alert dialog appear — **XSS confirmed ✓**

### 3.3 Second Payload Tested

```html
<svg onload="alert(document.domain)">
```

**Vector:** SVG inline event handler
**Result:** Alert displayed the document's domain, demonstrating information disclosure.

---

## 4. Vulnerable vs Secure Code

### Vulnerable (innerHTML)
```javascript
// ❌ User input parsed as HTML — scripts execute
bodyDiv.innerHTML = comment.body;
```

### Secure (textContent)
```javascript
// ✅ Everything treated as plain text — safe
bodyDiv.textContent = comment.body;
```

### PHP Equivalent
```php
// ❌ Vulnerable
echo "<div>" . $_POST['comment'] . "</div>";

// ✅ Secure
echo "<div>" . htmlspecialchars($_POST['comment'], ENT_QUOTES, 'UTF-8') . "</div>";
```

---

## 5. Why Stored XSS is More Dangerous Than Reflected XSS

Stored XSS is more dangerous than Reflected XSS because the malicious payload is permanently saved in the application's database and executes automatically for every user who views the infected page, with no further action required from the attacker. Reflected XSS requires the victim to click a crafted URL, limiting its reach; stored XSS affects all visitors passively. Additionally, stored XSS can persist for extended periods — potentially months — before being discovered, maximizing the attack surface and data exfiltration opportunity. A single injected comment on a high-traffic blog could compromise thousands of user sessions.

---

## 6. Defense Mechanism Implemented

**Output Encoding using `textContent`:**

By switching from `innerHTML` to `textContent`, all user-supplied content is treated as plain text by the browser. HTML tags and JavaScript code are rendered as visible characters rather than being parsed and executed. This single-line fix neutralizes all XSS vectors — script tags, event handlers, and SVG payloads alike.

Additional defenses recommended:
- Content Security Policy (`script-src 'self'`)
- HttpOnly flag on session cookies
- Server-side input validation with allowlists

---

## 7. Screenshots

*(Insert screenshots from the `screenshots/` folder)*

1. Screenshot of alert dialog triggered by stored XSS payload
2. Screenshot of secure mode rendering payload as text
3. Screenshot of the vulnerable code line (`innerHTML`)

---

## 8. Conclusion

This lab successfully demonstrated the Stored XSS vulnerability and its mitigation. The root cause is rendering untrusted user input as HTML via `innerHTML`. The fix is straightforward: use `textContent` for user-supplied content, ensuring it is never interpreted as executable code. Layered defenses (CSP, HttpOnly cookies, input validation) provide additional security guarantees.

---

*SecBlog Cybersecurity Lab — Stored XSS Mini Project*
