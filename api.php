<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$env = parse_ini_file('.env');
$host = $env['DB_HOST'] ?? 'localhost';
$db   = $env['DB_NAME'] ?? 'nexus_crm';
$user = $env['DB_USER'] ?? '';
$pass = $env['DB_PASS'] ?? '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die(json_encode(["error" => "Conexión fallida: " . $e->getMessage()]));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    switch ($action) {
        case 'products':
            $stmt = $pdo->query("SELECT * FROM products ORDER BY category, name");
            echo json_encode($stmt->fetchAll());
            break;
        case 'users':
            $stmt = $pdo->query("SELECT id, name, email, role, avatar, status FROM users ORDER BY name");
            echo json_encode($stmt->fetchAll());
            break;
        case 'quotations':
            $stmt = $pdo->query("SELECT * FROM quotations ORDER BY created_at DESC");
            $quotes = $stmt->fetchAll();
            // In a real app we would join items, but keeping it simple for now
            echo json_encode($quotes);
            break;
        default:
            echo json_encode(["status" => "Nexus API Running"]);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    switch ($action) {
        case 'create_quotation':
            $pdo->beginTransaction();
            try {
                $qId = bin2hex(random_bytes(18)); // Simple UUID replacement
                $stmt = $pdo->prepare("INSERT INTO quotations (id, customer_name, customer_phone, total, user_id) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$qId, $data['customerName'], $data['customerPhone'], $data['total'], $data['userId']]);

                foreach ($data['items'] as $item) {
                    $stmtItem = $pdo->prepare("INSERT INTO quotation_items (id, quotation_id, product_id, quantity, unit_price, subtotal) VALUES (UUID(), ?, ?, ?, ?, ?)");
                    $stmtItem->execute([$qId, $item['productId'], $item['quantity'], $item['unitPrice'], $item['subtotal']]);
                }
                $pdo->commit();
                echo json_encode(["success" => true, "id" => $qId]);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(["success" => false, "error" => $e->getMessage()]);
            }
            break;
        
        case 'create_user':
            $stmt = $pdo->prepare("INSERT INTO users (id, name, email, role, avatar, status) VALUES (UUID(), ?, ?, ?, ?, 'ACTIVE')");
            $stmt->execute([$data['name'], $data['email'], $data['role'], $data['avatar']]);
            echo json_encode(["success" => true]);
            break;

        case 'delete_user':
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(["success" => true]);
            break;

        case 'update_stock':
            $pdo->beginTransaction();
            foreach ($data['counts'] as $id => $quantity) {
                $stmt = $pdo->prepare("UPDATE products SET stock = ?, last_counted = CURRENT_DATE WHERE id = ?");
                $stmt->execute([$quantity, $id]);
            }
            $pdo->commit();
            echo json_encode(["success" => true]);
            break;
    }
}
?>