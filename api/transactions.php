<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check if user is authenticated
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

switch ($method) {
    case 'POST':
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'add':
                addTransaction($pdo, $userId, $input);
                break;
            case 'deposit':
                deposit($pdo, $userId, $input);
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
        break;
    
    case 'GET':
        $action = $_GET['action'] ?? 'list';
        
        switch ($action) {
            case 'list':
                getTransactions($pdo, $userId);
                break;
            case 'balance':
                getBalance($pdo, $userId);
                break;
            case 'summary':
                getSummary($pdo, $userId);
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
        break;
    
    case 'DELETE':
        $transactionId = $input['id'] ?? 0;
        deleteTransaction($pdo, $userId, $transactionId);
        break;
    
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

function addTransaction($pdo, $userId, $input) {
    $description = trim($input['description'] ?? '');
    $amount = floatval($input['amount'] ?? 0);
    $type = $input['type'] ?? '';
    $category = $input['category'] ?? '';
    $date = $input['date'] ?? date('Y-m-d');
    
    // Validation
    if (empty($description) || $amount <= 0 || empty($type) || empty($category)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }
    
    if (!in_array($type, ['income', 'expense'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid transaction type']);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Insert transaction
        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, description, amount, type, category, transaction_date) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $description, $amount, $type, $category, $date]);
        
        // Update account balance
        $balanceChange = $type === 'income' ? $amount : -$amount;
        $stmt = $pdo->prepare("UPDATE accounts SET balance = balance + ? WHERE user_id = ?");
        $stmt->execute([$balanceChange, $userId]);
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'message' => 'Transaction added successfully']);
        
    } catch(PDOException $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function deposit($pdo, $userId, $input) {
    $amount = floatval($input['amount'] ?? 0);
    
    if ($amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Amount must be greater than 0']);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Insert deposit transaction
        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, description, amount, type, category, transaction_date) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, 'Deposit', $amount, 'income', 'deposit', date('Y-m-d')]);
        
        // Update account balance
        $stmt = $pdo->prepare("UPDATE accounts SET balance = balance + ? WHERE user_id = ?");
        $stmt->execute([$amount, $userId]);
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'message' => 'Deposit successful']);
        
    } catch(PDOException $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function getTransactions($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, created_at DESC LIMIT 50");
        $stmt->execute([$userId]);
        $transactions = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'transactions' => $transactions]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function getBalance($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("SELECT balance FROM accounts WHERE user_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        
        $balance = $result ? $result['balance'] : 0;
        
        echo json_encode(['success' => true, 'balance' => $balance]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function getSummary($pdo, $userId) {
    try {
        // Get current month data
        $currentMonth = date('Y-m');
        $stmt = $pdo->prepare("
            SELECT 
                type,
                SUM(amount) as total
            FROM transactions 
            WHERE user_id = ? AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
            GROUP BY type
        ");
        $stmt->execute([$userId, $currentMonth]);
        $currentMonthData = $stmt->fetchAll();
        
        $monthlyIncome = 0;
        $monthlyExpenses = 0;
        
        foreach ($currentMonthData as $row) {
            if ($row['type'] === 'income') {
                $monthlyIncome = $row['total'];
            } else {
                $monthlyExpenses = $row['total'];
            }
        }
        
        // Get monthly summary for last 6 months
        $stmt = $pdo->prepare("
            SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                type,
                SUM(amount) as total
            FROM transactions 
            WHERE user_id = ? AND transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month, type
            ORDER BY month DESC
        ");
        $stmt->execute([$userId]);
        $monthlyData = $stmt->fetchAll();
        
        // Format monthly data
        $monthlyummary = [];
        foreach ($monthlyData as $row) {
            $month = $row['month'];
            if (!isset($monthlySummary[$month])) {
                $monthlySummary[$month] = ['income' => 0, 'expense' => 0];
            }
            $monthlySummary[$month][$row['type']] = $row['total'];
        }
        
        // Get account balance
        $stmt = $pdo->prepare("SELECT balance FROM accounts WHERE user_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        $balance = $result ? $result['balance'] : 0;
        
        echo json_encode([
            'success' => true,
            'summary' => [
                'balance' => $balance,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpenses' => $monthlyExpenses,
                'netMonthly' => $monthlyIncome - $monthlyExpenses,
                'monthlySummary' => $monthlySummary
            ]
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function deleteTransaction($pdo, $userId, $transactionId) {
    try {
        $pdo->beginTransaction();
        
        // Get transaction details first
        $stmt = $pdo->prepare("SELECT amount, type FROM transactions WHERE id = ? AND user_id = ?");
        $stmt->execute([$transactionId, $userId]);
        $transaction = $stmt->fetch();
        
        if (!$transaction) {
            echo json_encode(['success' => false, 'message' => 'Transaction not found']);
            return;
        }
        
        // Delete transaction
        $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?");
        $stmt->execute([$transactionId, $userId]);
        
        // Update account balance (reverse the transaction)
        $balanceChange = $transaction['type'] === 'income' ? -$transaction['amount'] : $transaction['amount'];
        $stmt = $pdo->prepare("UPDATE accounts SET balance = balance + ? WHERE user_id = ?");
        $stmt->execute([$balanceChange, $userId]);
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'message' => 'Transaction deleted successfully']);
        
    } catch(PDOException $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
