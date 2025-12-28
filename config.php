<?php
// Datos de tu conexión Neon
$host = 'ep-shiny-unit-adiqn7rh-pooler.c-2.us-east-1.aws.neon.tech';
$db   = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_px4kLbqlJ6rB';
$endpoint = 'ep-shiny-unit-adiqn7rh-pooler'; // Este es tu Endpoint ID

try {
    // Hemos añadido: options='--endpoint=$endpoint'
    $dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require;options='--endpoint=$endpoint'";
    
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
} catch (PDOException $e) {
    die("Error conectando a Neon: " . $e->getMessage());
}
?>
