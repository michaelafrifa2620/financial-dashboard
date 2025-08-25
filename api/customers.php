<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class CustomerAPI {
    private $db;
    
    public function __construct() {
        global $pdo;
        $this->db = $pdo;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        
        switch ($method) {
            case 'GET':
                if (isset($_GET['id'])) {
                    $this->getCustomer($_GET['id']);
                } else {
                    $this->getAllCustomers();
                }
                break;
            case 'POST':
                $this->createCustomer();
                break;
            case 'PUT':
                if (isset($_GET['id'])) {
                    $this->updateCustomer($_GET['id']);
                } else {
                    $this->sendError('Customer ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if (isset($_GET['id'])) {
                    $this->deleteCustomer($_GET['id']);
                } else {
                    $this->sendError('Customer ID is required for deletion', 400);
                }
                break;
            default:
                $this->sendError('Method not allowed', 405);
        }
    }
    
    private function getAllCustomers() {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, 
                       COUNT(a.id) as account_count,
                       COALESCE(SUM(a.balance), 0) as total_balance
                FROM customers c 
                LEFT JOIN accounts a ON c.id = a.customer_id 
                GROUP BY c.id 
                ORDER BY c.date_created DESC
            ");
            $stmt->execute();
            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->sendResponse($customers);
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage(), 500);
        }
    }
    
    private function getCustomer($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, 
                       COUNT(a.id) as account_count,
                       COALESCE(SUM(a.balance), 0) as total_balance
                FROM customers c 
                LEFT JOIN accounts a ON c.id = a.customer_id 
                WHERE c.id = ? 
                GROUP BY c.id
            ");
            $stmt->execute([$id]);
            $customer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($customer) {
                // Get customer's accounts
                $stmt = $this->db->prepare("
                    SELECT * FROM accounts WHERE customer_id = ? ORDER BY date_created DESC
                ");
                $stmt->execute([$id]);
                $customer['accounts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $this->sendResponse($customer);
            } else {
                $this->sendError('Customer not found', 404);
            }
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage(), 500);
        }
    }
    
    private function createCustomer() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $required = ['id', 'first_name', 'last_name', 'gender', 'date_of_birth', 
                        'citizenship', 'marital_status', 'hometown'];
            
            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    $this->sendError("Field '$field' is required", 400);
                    return;
                }
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO customers (id, first_name, last_name, gender, date_of_birth, 
                                     citizenship, marital_status, hometown, phone, email, address)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $input['id'],
                $input['first_name'],
                $input['last_name'],
                $input['gender'],
                $input['date_of_birth'],
                $input['citizenship'],
                $input['marital_status'],
                $input['hometown'],
                $input['phone'] ?? null,
                $input['email'] ?? null,
                $input['address'] ?? null
            ]);
            
            $this->sendResponse(['message' => 'Customer created successfully', 'id' => $input['id']], 201);
            
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                $this->sendError('Customer with this ID already exists', 409);
            } else {
                $this->sendError('Database error: ' . $e->getMessage(), 500);
            }
        }
    }
    
    private function updateCustomer($id) {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $this->db->prepare("
                UPDATE customers 
                SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ?,
                    citizenship = ?, marital_status = ?, hometown = ?, phone = ?, 
                    email = ?, address = ?
                WHERE id = ?
            ");
            
            $affected = $stmt->execute([
                $input['first_name'],
                $input['last_name'],
                $input['gender'],
                $input['date_of_birth'],
                $input['citizenship'],
                $input['marital_status'],
                $input['hometown'],
                $input['phone'] ?? null,
                $input['email'] ?? null,
                $input['address'] ?? null,
                $id
            ]);
            
            if ($stmt->rowCount() > 0) {
                $this->sendResponse(['message' => 'Customer updated successfully']);
            } else {
                $this->sendError('Customer not found or no changes made', 404);
            }
            
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage(), 500);
        }
    }
    
    private function deleteCustomer($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM customers WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                $this->sendResponse(['message' => 'Customer deleted successfully']);
            } else {
                $this->sendError('Customer not found', 404);
            }
            
        } catch (PDOException $e) {
            $this->sendError('Database error: ' . $e->getMessage(), 500);
        }
    }
    
    private function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode(['success' => true, 'data' => $data]);
    }
    
    private function sendError($message, $statusCode = 400) {
        http_response_code($statusCode);
        echo json_encode(['success' => false, 'error' => $message]);
    }
}

$api = new CustomerAPI();
$api->handleRequest();
?>
