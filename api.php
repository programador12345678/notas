<?php
require 'config.php';

$action = $_GET['action'] ?? '';

// Obtener notas de un estudiante
if ($action == 'get_notas') {
    $estudiante = $_GET['estudiante'];
    $stmt = $pdo->prepare("SELECT * FROM materias WHERE estudiante_id = ? ORDER BY nombre_materia ASC");
    $stmt->execute([$estudiante]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// Actualizar una nota específica
if ($action == 'update_nota') {
    $est_id = $_POST['estudiante'];
    $materia = $_POST['materia'];
    $columna = $_POST['columna']; // coti, inte o exam
    $valor = $_POST['valor'];

    // Validar columna para seguridad
    if (!in_array($columna, ['coti', 'inte', 'exam'])) exit;

    $sql = "UPDATE materias SET $columna = ? WHERE estudiante_id = ? AND nombre_materia = ?";
    $pdo->prepare($sql)->execute([$valor, $est_id, $materia]);
    echo json_encode(['status' => 'ok']);
}
?>
