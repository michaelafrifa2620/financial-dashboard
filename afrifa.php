<?php
// afrifa.php - Custom functionality
session_start();

// Include database connection
require_once 'config/database.php';

// Set content type to JSON
header('Content-Type: application/json');

try {
    // Test database connection
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'afrifa.php is working!',
        'user_count' => $result['count'],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
