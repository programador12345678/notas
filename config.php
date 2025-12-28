<?php
// Tus credenciales de Neon
$host = 'ep-shiny-unit-adiqn7rh-pooler.c-2.us-east-1.aws.neon.tech';
$db   = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_px4kLbqlJ6rB';

try {
    $dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    session_start();
} catch (PDOException $e) {
    die("Error conectando a Neon: " . $e->getMessage());
}
?>
