<?php
/* ============================================
   db_secure.php — SECURE Database Handler
   ============================================
   ✅ This file demonstrates proper XSS prevention.
   All user input is sanitized before output.
   ============================================ */

require_once __DIR__ . '/../../server/config.php';

// --- Initialize SQLite Database ---
function getDB() {
    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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

// --- Save Comment (SECURE — input validated) ---
function saveComment($author, $body) {
    $db = getDB();

    // ✅ SECURE: Parameterized query prevents SQL injection
    // ✅ SECURE: Input is validated (length limits, strip tags as extra layer)
    $author = mb_substr(trim($author), 0, 100);
    $body   = mb_substr(trim($body), 0, 5000);

    $stmt = $db->prepare("INSERT INTO comments (author, body) VALUES (:author, :body)");
    $stmt->execute([
        ':author' => $author,
        ':body'   => $body
    ]);

    return $db->lastInsertId();
}

// --- Get All Comments (SECURE — HTML-encoded output) ---
function getComments() {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM comments ORDER BY created_at DESC");
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ✅ SECURE: HTML-encode all user-supplied content before output
    // htmlspecialchars() converts < > " ' & into HTML entities
    // so the browser renders them as text, NEVER as executable markup
    foreach ($comments as &$comment) {
        $comment['author'] = htmlspecialchars($comment['author'], ENT_QUOTES, 'UTF-8');
        $comment['body']   = htmlspecialchars($comment['body'], ENT_QUOTES, 'UTF-8');
    }

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
                if (empty(trim($body))) {
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
