<?php
/* ============================================
   config.php — Database & App Configuration
   ============================================ */

// Error reporting (enable for development)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database path (SQLite)
define('DB_PATH', __DIR__ . '/db.sqlite');

// Application mode
define('APP_MODE', 'vulnerable'); // 'vulnerable' or 'secure'

// CORS headers for local development
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
