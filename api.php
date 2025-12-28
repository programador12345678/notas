<?php
header('Content-Type: application/json');
$host = 'ep-shiny-unit-adiqn7rh-pooler.c-2.us-east-1.aws.neon.tech';
$db   = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_px4kLbqlJ6rB';
$endpoint = 'ep-shiny-unit-adiqn7rh-pooler';

try {
    $dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require;options='--endpoint=$endpoint'";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

// LOGIN: Verifica usuario y devuelve sus permisos
if ($action == 'login') {
    $u = $_POST['user'] ?? '';
    $p = $_POST['pass'] ?? '';
    $stmt = $pdo->prepare("SELECT id, rol, name, access FROM usuarios WHERE id = ? AND password = ?");
    $stmt->execute([$u, $p]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($user ? $user : ["error" => "Credenciales incorrectas"]);
}

// OBTENER NOTAS: Trae las filas de la tabla notas
if ($action == 'get_notas') {
    $est = $_GET['estudiante'];
    $stmt = $pdo->prepare("SELECT materia, coti, inte, exam FROM notas WHERE estudiante_id = ? ORDER BY materia ASC");
    $stmt->execute([$est]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// ACTUALIZAR NOTA: Guarda o actualiza (Upsert)
if ($action == 'update_nota') {
    $est = $_POST['estudiante'];
    $mat = $_POST['materia'];
    $col = $_POST['columna']; // coti, inte o exam
    $val = $_POST['valor'];
    
    // Solo permitimos editar columnas específicas por seguridad
    if (!in_array($col, ['coti', 'inte', 'exam'])) exit;

    $sql = "UPDATE notas SET $col = ? WHERE estudiante_id = ? AND materia = ?";
    $pdo->prepare($sql)->execute([$val, $est, $mat]);
    echo json_encode(["status" => "ok"]);
}
?>
