-- Financial Dashboard Database Initialization
-- Run this script in phpMyAdmin or MySQL command line

CREATE DATABASE IF NOT EXISTS financial_dashboard;
USE financial_dashboard;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    date_of_birth DATE NOT NULL,
    citizenship VARCHAR(50) NOT NULL,
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed') NOT NULL,
    hometown VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id VARCHAR(10) NOT NULL,
    account_type ENUM('Savings', 'Current', 'Fixed', 'Business') NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    initial_deposit DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Transactions table for batch operations
CREATE TABLE IF NOT EXISTS batch_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    customer_id VARCHAR(10) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal') DEFAULT 'deposit',
    amount DECIMAL(15,2) NOT NULL,
    previous_balance DECIMAL(15,2) NOT NULL,
    new_balance DECIMAL(15,2) NOT NULL,
    description TEXT,
    status ENUM('completed', 'pending', 'failed') DEFAULT 'completed',
    processed_by VARCHAR(100),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (account_number) REFERENCES accounts(account_number)
);

-- Users table for system authentication
CREATE TABLE IF NOT EXISTS system_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teller', 'manager') DEFAULT 'teller',
    status ENUM('active', 'inactive') DEFAULT 'active',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Account enquiry log table
CREATE TABLE IF NOT EXISTS account_enquiry_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(10) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    enquiry_type VARCHAR(50),
    searched_by VARCHAR(100),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (account_number) REFERENCES accounts(account_number)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO system_users (username, email, password_hash, role) 
VALUES ('admin', 'admin@afrifa-susu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Create indexes for better performance
CREATE INDEX idx_customers_name ON customers(first_name, last_name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_accounts_customer ON accounts(customer_id);
CREATE INDEX idx_transactions_batch ON batch_transactions(batch_id);
CREATE INDEX idx_transactions_account ON batch_transactions(account_number);
CREATE INDEX idx_transactions_date ON batch_transactions(date_created);
