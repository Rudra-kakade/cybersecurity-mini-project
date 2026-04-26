<?php
/* ============================================
   db.php — VULNERABLE Database Handler
   ============================================
   ❌ This file intentionally contains security
   vulnerabilities for educational purposes.
   DO NOT use this pattern in production code.
   ============================================ */

require_once __DIR__ . '/config.php';

// --- Initialize SQLite Database ---
function getDB() {
    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create comments table if not exists
    $db->exec("
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    return $db;
}

// --- Save Comment (VULNERABLE — no sanitization) ---
function saveComment($author, $body) {
    $db = getDB();

    // ❌ VULNERABLE: Using parameterized query for SQL injection prevention,
    // but NOT sanitizing the body content for XSS.
    // The raw HTML/script payload is stored as-is in the database.
    $stmt = $db->prepare("INSERT INTO comments (author, body) VALUES (:author, :body)");
    $stmt->execute([
        ':author' => $author,
        ':body'   => $body   // ← Raw user input — stored without encoding!
    ]);

    return $db->lastInsertId();
}

// --- Get All Comments (VULNERABLE — returns raw HTML) ---
function getComments() {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM comments ORDER BY created_at DESC");
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ❌ VULNERABLE: Returns raw body content without HTML encoding.
    // When rendered with innerHTML on the client, any stored scripts will execute.
    return $comments;
}

// --- Delete All Comments ---
function clearAllComments() {
    $db = getDB();
    $db->exec("DELETE FROM comments");
    return true;
}

// --- API Router ---
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['action'])) {
        switch ($input['action']) {
            case 'add':
                $author = $input['author'] ?? 'Anonymous';
                $body   = $input['body'] ?? '';
                if (empty($body)) {
                    echo json_encode(['error' => 'Comment body is required']);
                    exit;
                }
                $id = saveComment($author, $body);
                echo json_encode(['success' => true, 'id' => $id]);
                break;

            case 'clear':
                clearAllComments();
                echo json_encode(['success' => true]);
                break;

            default:
                echo json_encode(['error' => 'Unknown action']);
        }
    }
} elseif ($method === 'GET') {
    $comments = getComments();
    echo json_encode($comments);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
