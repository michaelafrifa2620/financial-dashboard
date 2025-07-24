<?php
// Batch Operations API - Enhanced Integration Layer
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

class BatchOperationsAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';
        
        try {
            switch ($method) {
                case 'GET':
                    return $this->handleGet($action);
                case 'POST':
                    return $this->handlePost($action);
                case 'PUT':
                    return $this->handlePut($action);
                case 'DELETE':
                    return $this->handleDelete($action);
                default:
                    return $this->errorResponse('Method not allowed', 405);
            }
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    private function handleGet($action) {
        switch ($action) {
            case 'customers':
                return $this->getCustomers();
            case 'transactions':
                return $this->getTransactions();
            case 'customer-accounts':
                return $this->getCustomerAccounts($_GET['customer_id'] ?? null);
            case 'batch-history':
                return $this->getBatchHistory();
            default:
                return $this->errorResponse('Invalid action', 400);
        }
    }
    
    private function handlePost($action) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'save-batch':
                return $this->saveBatch($input);
            case 'create-customer':
                return $this->createCustomer($input);
            case 'generate-account':
                return $this->generateAccount($input);
            default:
                return $this->errorResponse('Invalid action', 400);
        }
    }
    
    // Get all customers with account information
    private function getCustomers() {
        $stmt = $this->pdo->prepare("
            SELECT 
                u.id,
                CONCAT(u.firstname, ' ', u.lastname) as name,
                u.email,
                u.firstname,
                u.lastname,
                a.balance,
                CONCAT('ACC', LPAD(u.id, 6, '0')) as accountNumber,
                CONCAT(u.firstname, ' ', u.lastname, ' - Savings') as accountName
            FROM users u
            LEFT JOIN accounts a ON u.id = a.user_id
            ORDER BY u.firstname, u.lastname
        ");
        
        $stmt->execute();
        $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure balance is set
        foreach ($customers as &$customer) {
            $customer['balance'] = $customer['balance'] ?? 0.00;
            $customer['balance'] = (float) $customer['balance'];
        }
        
        return $this->successResponse($customers);
    }
    
    // Get transactions history
    private function getTransactions() {
        $limit = $_GET['limit'] ?? 50;
        $offset = $_GET['offset'] ?? 0;
        
        $stmt = $this->pdo->prepare("
            SELECT 
                t.*,
                CONCAT(u.firstname, ' ', u.lastname) as customer_name,
                CONCAT('ACC', LPAD(u.id, 6, '0')) as account_number
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
            LIMIT :limit OFFSET :offset
        ");
        
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $this->successResponse($transactions);
    }
    
    // Get customer accounts
    private function getCustomerAccounts($customerId) {
        if (!$customerId) {
            return $this->errorResponse('Customer ID required', 400);
        }
        
        $stmt = $this->pdo->prepare("
            SELECT 
                u.id,
                CONCAT(u.firstname, ' ', u.lastname) as name,
                a.balance,
                CONCAT('ACC', LPAD(u.id, 6, '0')) as accountNumber,
                CONCAT(u.firstname, ' ', u.lastname, ' - Savings') as accountName
            FROM users u
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE u.id = :customer_id
        ");
        
        $stmt->execute(['customer_id' => $customerId]);
        $account = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$account) {
            return $this->errorResponse('Customer not found', 404);
        }
        
        $account['balance'] = (float) ($account['balance'] ?? 0.00);
        
        return $this->successResponse($account);
    }
    
    // Get batch history
    private function getBatchHistory() {
        $days = $_GET['days'] ?? 30;
        
        $stmt = $this->pdo->prepare("
            SELECT 
                t.*,
                CONCAT(u.firstname, ' ', u.lastname) as customer_name,
                CONCAT('ACC', LPAD(u.id, 6, '0')) as account_number,
                CONCAT(u.firstname, ' ', u.lastname, ' - Savings') as account_name,
                a.balance as current_balance
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
            ORDER BY t.created_at DESC
        ");
        
        $stmt->execute(['days' => $days]);
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format for display
        foreach ($history as &$record) {
            $record['amount'] = (float) $record['amount'];
            $record['current_balance'] = (float) ($record['current_balance'] ?? 0.00);
            $record['status'] = 'completed';
        }
        
        return $this->successResponse($history);
    }
    
    // Save batch transactions
    private function saveBatch($batchData) {
        if (!isset($batchData['entries']) || !is_array($batchData['entries'])) {
            return $this->errorResponse('Invalid batch data', 400);
        }
        
        $this->pdo->beginTransaction();
        
        try {
            $batchId = 'BATCH_' . date('YmdHis') . '_' . uniqid();
            $processedEntries = [];
            
            foreach ($batchData['entries'] as $entry) {
                // Validate entry
                if (!isset($entry['customerId']) || !isset($entry['depositAmount']) || $entry['depositAmount'] <= 0) {
                    continue;
                }
                
                $customerId = $entry['customerId'];
                $depositAmount = (float) $entry['depositAmount'];
                $description = $entry['description'] ?? 'Batch deposit';
                
                // Insert transaction
                $stmt = $this->pdo->prepare("
                    INSERT INTO transactions (user_id, description, amount, type, category, transaction_date)
                    VALUES (:user_id, :description, :amount, 'income', 'deposit', CURDATE())
                ");
                
                $stmt->execute([
                    'user_id' => $customerId,
                    'description' => $description,
                    'amount' => $depositAmount
                ]);
                
                // Update or create account balance
                $stmt = $this->pdo->prepare("
                    INSERT INTO accounts (user_id, balance) 
                    VALUES (:user_id, :amount)
                    ON DUPLICATE KEY UPDATE balance = balance + :amount
                ");
                
                $stmt->execute([
                    'user_id' => $customerId,
                    'amount' => $depositAmount
                ]);
                
                // Get updated balance
                $stmt = $this->pdo->prepare("SELECT balance FROM accounts WHERE user_id = :user_id");
                $stmt->execute(['user_id' => $customerId]);
                $newBalance = $stmt->fetchColumn();
                
                $processedEntries[] = [
                    'customer_id' => $customerId,
                    'deposit_amount' => $depositAmount,
                    'new_balance' => (float) $newBalance,
                    'transaction_id' => $this->pdo->lastInsertId()
                ];
            }
            
            $this->pdo->commit();
            
            return $this->successResponse([
                'batch_id' => $batchId,
                'processed_entries' => count($processedEntries),
                'entries' => $processedEntries,
                'message' => 'Batch processed successfully'
            ]);
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return $this->errorResponse('Failed to process batch: ' . $e->getMessage(), 500);
        }
    }
    
    // Create new customer
    private function createCustomer($customerData) {
        $requiredFields = ['firstname', 'lastname', 'email'];
        
        foreach ($requiredFields as $field) {
            if (!isset($customerData[$field]) || empty($customerData[$field])) {
                return $this->errorResponse("Field '$field' is required", 400);
            }
        }
        
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO users (firstname, lastname, email, password)
                VALUES (:firstname, :lastname, :email, :password)
            ");
            
            $stmt->execute([
                'firstname' => $customerData['firstname'],
                'lastname' => $customerData['lastname'],
                'email' => $customerData['email'],
                'password' => password_hash($customerData['password'] ?? 'default123', PASSWORD_DEFAULT)
            ]);
            
            $customerId = $this->pdo->lastInsertId();
            
            // Create account with initial balance
            $initialBalance = $customerData['initial_balance'] ?? 0.00;
            
            $stmt = $this->pdo->prepare("
                INSERT INTO accounts (user_id, balance)
                VALUES (:user_id, :balance)
            ");
            
            $stmt->execute([
                'user_id' => $customerId,
                'balance' => $initialBalance
            ]);
            
            return $this->successResponse([
                'customer_id' => $customerId,
                'account_number' => 'ACC' . str_pad($customerId, 6, '0', STR_PAD_LEFT),
                'message' => 'Customer created successfully'
            ]);
            
        } catch (PDOException $e) {
            if ($e->getCode() == '23000') { // Unique constraint violation
                return $this->errorResponse('Email already exists', 409);
            }
            return $this->errorResponse('Failed to create customer: ' . $e->getMessage(), 500);
        }
    }
    
    // Generate account number for existing customer
    private function generateAccount($data) {
        $customerId = $data['customer_id'] ?? null;
        
        if (!$customerId) {
            return $this->errorResponse('Customer ID required', 400);
        }
        
        // Check if customer exists
        $stmt = $this->pdo->prepare("SELECT id, firstname, lastname FROM users WHERE id = :id");
        $stmt->execute(['id' => $customerId]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$customer) {
            return $this->errorResponse('Customer not found', 404);
        }
        
        // Generate account number
        $accountNumber = 'ACC' . str_pad($customerId, 6, '0', STR_PAD_LEFT);
        $accountName = $customer['firstname'] . ' ' . $customer['lastname'] . ' - Savings';
        
        return $this->successResponse([
            'account_number' => $accountNumber,
            'account_name' => $accountName,
            'customer_name' => $customer['firstname'] . ' ' . $customer['lastname']
        ]);
    }
    
    // Helper methods
    private function successResponse($data, $message = 'Success') {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ];
    }
    
    private function errorResponse($message, $code = 400) {
        http_response_code($code);
        return [
            'success' => false,
            'error' => $message,
            'code' => $code,
            'timestamp' => date('c')
        ];
    }
}

// Initialize and handle request
try {
    $api = new BatchOperationsAPI($pdo);
    $response = $api->handleRequest();
    echo json_encode($response, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error: ' . $e->getMessage(),
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
}
?>
