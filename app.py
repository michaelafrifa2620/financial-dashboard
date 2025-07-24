from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
import hashlib
import os
from datetime import datetime, timedelta
import random

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# Database setup
def init_db():
    conn = sqlite3.connect('financial_dashboard.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Financial transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            category TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def get_db_connection():
    conn = sqlite3.connect('financial_dashboard.db')
    conn.row_factory = sqlite3.Row
    return conn

# Routes
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if not username or not email or not password:
            flash('All fields are required!', 'error')
            return render_template('register.html')
        
        conn = get_db_connection()
        
        # Check if user already exists
        existing_user = conn.execute('SELECT id FROM users WHERE username = ? OR email = ?', 
                                   (username, email)).fetchone()
        
        if existing_user:
            flash('Username or email already exists!', 'error')
            conn.close()
            return render_template('register.html')
        
        # Create new user
        password_hash = hash_password(password)
        conn.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                    (username, email, password_hash))
        conn.commit()
        conn.close()
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE username = ? AND password_hash = ?',
                           (username, hash_password(password))).fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password!', 'error')
    
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please login to access dashboard!', 'error')
        return redirect(url_for('login'))
    
    conn = get_db_connection()
    user_id = session['user_id']
    
    # Get user's transactions
    transactions = conn.execute('''
        SELECT * FROM transactions 
        WHERE user_id = ? 
        ORDER BY date DESC 
        LIMIT 20
    ''', (user_id,)).fetchall()
    
    # Calculate summary statistics
    income = conn.execute('''
        SELECT COALESCE(SUM(amount), 0) FROM transactions 
        WHERE user_id = ? AND type = 'income'
    ''', (user_id,)).fetchone()[0]
    
    expenses = conn.execute('''
        SELECT COALESCE(SUM(amount), 0) FROM transactions 
        WHERE user_id = ? AND type = 'expense'
    ''', (user_id,)).fetchone()[0]
    
    balance = income - expenses
    
    # Get monthly data for chart
    monthly_data = conn.execute('''
        SELECT 
            strftime('%Y-%m', date) as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE user_id = ? 
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
        LIMIT 12
    ''', (user_id,)).fetchall()
    
    conn.close()
    
    return render_template('dashboard.html', 
                         transactions=transactions,
                         income=income,
                         expenses=expenses,
                         balance=balance,
                         monthly_data=monthly_data)

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    transaction_type = request.form['type']
    amount = float(request.form['amount'])
    description = request.form['description']
    category = request.form['category']
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO transactions (user_id, type, amount, description, category)
        VALUES (?, ?, ?, ?, ?)
    ''', (session['user_id'], transaction_type, amount, description, category))
    conn.commit()
    conn.close()
    
    flash('Transaction added successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully!', 'success')
    return redirect(url_for('index'))

# Initialize database and add sample data
def add_sample_data():
    conn = get_db_connection()
    
    # Check if sample data already exists
    sample_user = conn.execute('SELECT id FROM users WHERE username = ?', ('demo',)).fetchone()
    
    if not sample_user:
        # Add sample user
        password_hash = hash_password('demo123')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                    ('demo', 'demo@example.com', password_hash))
        
        user_id = cursor.lastrowid
        
        # Add sample transactions
        sample_transactions = [
            ('income', 5000, 'Salary', 'Salary'),
            ('expense', 1200, 'Rent', 'Housing'),
            ('expense', 400, 'Groceries', 'Food'),
            ('expense', 150, 'Utilities', 'Bills'),
            ('income', 500, 'Freelance work', 'Freelance'),
            ('expense', 200, 'Gas', 'Transportation'),
            ('expense', 100, 'Internet', 'Bills'),
            ('income', 200, 'Investment dividends', 'Investment'),
            ('expense', 80, 'Phone bill', 'Bills'),
            ('expense', 300, 'Shopping', 'Entertainment'),
        ]
        
        for trans_type, amount, desc, category in sample_transactions:
            # Add some randomness to dates
            days_ago = random.randint(1, 30)
            date = datetime.now() - timedelta(days=days_ago)
            conn.execute('''
                INSERT INTO transactions (user_id, type, amount, description, category, date)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, trans_type, amount, desc, category, date))
        
        conn.commit()
    
    conn.close()

if __name__ == '__main__':
    init_db()
    add_sample_data()
    app.run(debug=True, host='0.0.0.0', port=5000)
