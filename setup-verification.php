<?php
// Setup Verification and Configuration Script
// Run this file to verify and setup your financial dashboard

echo "<h1>Financial Dashboard - Setup Verification</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f7fa; }
    .success { color: #27ae60; background: #d4edda; padding: 10px; border-radius: 5px; margin: 5px 0; }
    .error { color: #e74c3c; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 5px 0; }
    .info { color: #3498db; background: #d1ecf1; padding: 10px; border-radius: 5px; margin: 5px 0; }
    .section { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
</style>";

// Check PHP version
echo "<div class='section'>";
echo "<h2>1. PHP Configuration Check</h2>";
if (version_compare(PHP_VERSION, '7.4.0') >= 0) {
    echo "<div class='success'>✓ PHP Version: " . PHP_VERSION . " (Good)</div>";
} else {
    echo "<div class='error'>✗ PHP Version: " . PHP_VERSION . " (Recommended: 7.4+)</div>";
}

// Check required extensions
$required_extensions = ['mysqli', 'pdo', 'pdo_mysql', 'json'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "<div class='success'>✓ Extension '$ext' is loaded</div>";
    } else {
        echo "<div class='error'>✗ Extension '$ext' is NOT loaded</div>";
    }
}
echo "</div>";

// Database Connection Test
echo "<div class='section'>";
echo "<h2>2. Database Connection Test</h2>";

try {
    require_once 'config/database.php';
    echo "<div class='success'>✓ Database connection file exists</div>";
    
    // Test connection
    $test_query = $pdo->query("SELECT 1");
    if ($test_query) {
        echo "<div class='success'>✓ Database connection successful</div>";
    }
    
    // Check if tables exist
    $tables = ['users', 'transactions', 'accounts'];
    foreach ($tables as $table) {
        $check_table = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($check_table && $check_table->rowCount() > 0) {
            echo "<div class='success'>✓ Table '$table' exists</div>";
        } else {
            echo "<div class='error'>✗ Table '$table' does not exist</div>";
            
            // Create table if it doesn't exist
            if ($table == 'users') {
                $create_users = "CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    firstname VARCHAR(50) NOT NULL,
                    lastname VARCHAR(50) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )";
                if ($pdo->exec($create_users) !== false) {
                    echo "<div class='success'>✓ Table 'users' created successfully</div>";
                }
            }
            
            if ($table == 'transactions') {
                $create_transactions = "CREATE TABLE IF NOT EXISTS transactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    description VARCHAR(255) NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    type ENUM('income', 'expense') NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    transaction_date DATE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )";
                if ($pdo->exec($create_transactions) !== false) {
                    echo "<div class='success'>✓ Table 'transactions' created successfully</div>";
                }
            }
            
            if ($table == 'accounts') {
                $create_accounts = "CREATE TABLE IF NOT EXISTS accounts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    balance DECIMAL(10, 2) DEFAULT 0.00,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )";
                if ($pdo->exec($create_accounts) !== false) {
                    echo "<div class='success'>✓ Table 'accounts' created successfully</div>";
                }
            }
        }
    }
    
} catch (Exception $e) {
    echo "<div class='error'>✗ Database Error: " . $e->getMessage() . "</div>";
    echo "<div class='info'>Please check your database configuration in config/database.php</div>";
}
echo "</div>";

// File Permissions Check
echo "<div class='section'>";
echo "<h2>3. File Permissions Check</h2>";
$files_to_check = [
    'index.html',
    'account-batch.html', 
    'account-batch.js',
    'styles.css',
    'config/database.php'
];

foreach ($files_to_check as $file) {
    if (file_exists($file)) {
        if (is_readable($file)) {
            echo "<div class='success'>✓ File '$file' is readable</div>";
        } else {
            echo "<div class='error'>✗ File '$file' is not readable</div>";
        }
    } else {
        echo "<div class='error'>✗ File '$file' does not exist</div>";
    }
}
echo "</div>";

// XAMPP Services Check
echo "<div class='section'>";
echo "<h2>4. XAMPP Services Status</h2>";
echo "<div class='info'>Please ensure the following services are running in XAMPP Control Panel:</div>";
echo "<ul>";
echo "<li>Apache Web Server</li>";
echo "<li>MySQL Database</li>";
echo "</ul>";

// Check if we can access the web server
$server_url = "http://localhost/financial_dashboard/";
echo "<div class='info'>Access your application at: <a href='$server_url' target='_blank'>$server_url</a></div>";
echo "</div>";

// Quick Setup Instructions
echo "<div class='section'>";
echo "<h2>5. Quick Setup Instructions</h2>";
echo "<ol>";
echo "<li><strong>Start XAMPP:</strong> Open XAMPP Control Panel and start Apache and MySQL</li>";
echo "<li><strong>Access Application:</strong> Go to <a href='http://localhost/financial_dashboard/' target='_blank'>http://localhost/financial_dashboard/</a></li>";
echo "<li><strong>Login:</strong> Use any username/password to create an account</li>";
echo "<li><strong>Test Features:</strong> Try the Account Batch functionality with F2 search</li>";
echo "</ol>";
echo "</div>";

echo "<div class='section'>";
echo "<h2>6. Next Steps</h2>";
echo "<div class='info'>";
echo "<p><strong>Your Financial Dashboard is ready!</strong></p>";
echo "<p>Features available:</p>";
echo "<ul>";
echo "<li>✓ User Authentication System</li>";
echo "<li>✓ Excel-like Account Batch Interface</li>";
echo "<li>✓ F2 Customer Search Functionality</li>";
echo "<li>✓ Automatic Account Number Generation</li>";
echo "<li>✓ Real-time Balance Calculations</li>";
echo "<li>✓ Transaction History Tracking</li>";
echo "<li>✓ Responsive Design</li>";
echo "</ul>";
echo "</div>";
echo "</div>";
?>
