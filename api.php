<?php
require 'config.php';

if (!isset($_SESSION['user'])) exit;

$action = $_GET['action'] ?? '';

if ($action == 'get_grades') {
    $student = $_GET['student'];
    // Obtener materias y unirlas con sus notas
    $stmt = $pdo->prepare("SELECT s.name as subject_name, IFNULL(g.coti, 0) as coti, IFNULL(g.inte, 0) as inte, IFNULL(g.exam, 0) as exam 
                           FROM subjects s 
                           LEFT JOIN grades g ON s.name = g.subject_name AND g.student_key = ?
                           WHERE s.student_key = ?");
    $stmt->execute([$student, $student]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

if ($action == 'save_grade') {
    $student = $_POST['student'];
    $subject = $_POST['subject'];
    $column  = $_POST['column']; // coti, inte o exam
    $value   = $_POST['value'];

    // Insertar o actualizar nota (Upsert)
    $sql = "INSERT INTO grades (student_key, subject_name, $column) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE $column = ?";
    $pdo->prepare($sql)->execute([$student, $subject, $value, $value]);
}

if ($action == 'change_pass') {
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$_POST['password'], $_SESSION['user']['id']]);
}
?>
