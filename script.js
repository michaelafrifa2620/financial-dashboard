// Authentication functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

// Form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simple validation (in a real app, this would be server-side)
            if (username && password) {
                // Store user session
                localStorage.setItem('currentUser', username);
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Please fill in all fields');
            }
        });
    }
    
    // Signup form handler
    const signupForm = document.getElementById('signupFormElement');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (username && email && password) {
                // Store user data (in a real app, this would be server-side)
                const userData = {
                    username: username,
                    email: email
                };
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('currentUser', username);
                localStorage.setItem('isLoggedIn', 'true');
                
                alert('Account created successfully!');
                window.location.href = 'dashboard.html';
            } else {
                alert('Please fill in all fields');
            }
        });
    }
});

// Global variables
let currentUser = null;
let transactions = [];

// DOM elements
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageContainer = document.getElementById('messageContainer');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    setDefaultDate();
});

// Check authentication status (GitHub Pages compatible)
function checkAuthStatus() {
    // For GitHub Pages demo, use localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUsername = localStorage.getItem('currentUser');
    
    if (isLoggedIn === 'true' && currentUsername) {
        currentUser = { username: currentUsername, firstname: currentUsername };
        showDashboard();
    } else {
        showAuth();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth form switches
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Form submissions
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('depositForm').addEventListener('submit', handleDeposit);
    document.getElementById('transactionForm').addEventListener('submit', handleTransaction);
    document.getElementById('clearAllBtn').addEventListener('click', handleClearAll);
    
    // Filter transactions
    document.getElementById('filterType').addEventListener('change', filterTransactions);
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Show/hide sections
function showAuth() {
    authSection.style.display = 'block';
    dashboardSection.style.display = 'none';
}

function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    
    if (currentUser) {
        document.getElementById('welcomeMessage').textContent = 
            `Welcome, ${currentUser.firstname} ${currentUser.lastname}!`;
    }
    
    loadDashboardData();
}

function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            showMessage('Login successful!', 'success');
            showDashboard();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred during login', 'error');
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const firstname = document.getElementById('registerFirstname').value;
    const lastname = document.getElementById('registerLastname').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Registration successful! Please login.', 'success');
            showLoginForm();
            document.getElementById('registerFormElement').reset();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('An error occurred during registration', 'error');
    }
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'logout'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = null;
            showMessage('Logged out successfully', 'success');
            showAuth();
            showLoginForm();
        }
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('An error occurred during logout', 'error');
    }
}

// Handle deposit
async function handleDeposit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (amount <= 0) {
        showMessage('Please enter a valid amount', 'error');
        return;
    }
    
    try {
        const response = await fetch('api/transactions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deposit',
                amount: amount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Deposit successful!', 'success');
            document.getElementById('depositForm').reset();
            loadDashboardData();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Deposit error:', error);
        showMessage('An error occurred during deposit', 'error');
    }
}

// Handle transaction
async function handleTransaction(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    
    try {
        const response = await fetch('api/transactions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add',
                description: description,
                amount: amount,
                type: type,
                category: category,
                date: date
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Transaction added successfully!', 'success');
            document.getElementById('transactionForm').reset();
            setDefaultDate();
            loadDashboardData();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Transaction error:', error);
        showMessage('An error occurred while adding transaction', 'error');
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load summary
        const summaryResponse = await fetch('api/transactions.php?action=summary');
        const summaryData = await summaryResponse.json();
        
        if (summaryData.success) {
            updateSummaryCards(summaryData.summary);
            updateMonthlySummary(summaryData.summary.monthlySummary);
        }
        
        // Load transactions
        const transactionsResponse = await fetch('api/transactions.php?action=list');
        const transactionsData = await transactionsResponse.json();
        
        if (transactionsData.success) {
            transactions = transactionsData.transactions;
            displayTransactions(transactions);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Error loading dashboard data', 'error');
    }
}

// Update summary cards
function updateSummaryCards(summary) {
    document.getElementById('totalBalance').textContent = formatCurrency(summary.balance);
    document.getElementById('monthlyIncome').textContent = formatCurrency(summary.monthlyIncome);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(summary.monthlyExpenses);
    
    const netMonthly = summary.netMonthly;
    const netElement = document.getElementById('netMonthly');
    netElement.textContent = formatCurrency(netMonthly);
    
    // Add appropriate class for color
    netElement.className = 'amount';
    if (netMonthly > 0) {
        netElement.classList.add('income');
    } else if (netMonthly < 0) {
        netElement.classList.add('expense');
    }
}

// Update monthly summary
function updateMonthlySummary(monthlySummary) {
    const container = document.getElementById('monthlySummary');
    
    if (!monthlySummary || Object.keys(monthlySummary).length === 0) {
        container.innerHTML = '<p class="empty-state">No monthly data available yet.</p>';
        return;
    }
    
    let html = '';
    for (const [month, data] of Object.entries(monthlySummary)) {
        const net = data.income - data.expense;
        html += `
            <div class="monthly-item">
                <div class="monthly-month">${formatMonth(month)}</div>
                <div class="monthly-amounts">
                    <div class="monthly-income">+${formatCurrency(data.income)}</div>
                    <div class="monthly-expense">-${formatCurrency(data.expense)}</div>
                    <div class="monthly-net ${net >= 0 ? 'income' : 'expense'}">
                        ${formatCurrency(net)}
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Display transactions
function displayTransactions(transactionList) {
    const container = document.getElementById('transactionsList');
    
    if (transactionList.length === 0) {
        container.innerHTML = '<p class="empty-state">No transactions yet. Add your first transaction above!</p>';
        return;
    }
    
    let html = '';
    transactionList.forEach(transaction => {
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-details">
                        ${formatDate(transaction.transaction_date)} • 
                        <span class="transaction-category">${transaction.category}</span>
                    </div>
                </div>
                <div class="transaction-actions">
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                    </div>
                    <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Delete</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Delete transaction
async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        const response = await fetch('api/transactions.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Transaction deleted successfully', 'success');
            loadDashboardData();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('An error occurred while deleting transaction', 'error');
    }
}

// Filter transactions
function filterTransactions() {
    const filterType = document.getElementById('filterType').value;
    let filteredTransactions = transactions;
    
    if (filterType !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === filterType);
    }
    
    displayTransactions(filteredTransactions);
}

// Clear all data
async function handleClearAll() {
    if (!confirm('Are you sure you want to clear all transaction data? This action cannot be undone.')) {
        return;
    }
    
    // This would need to be implemented in the backend
    showMessage('Clear all functionality needs to be implemented', 'info');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatMonth(monthString) {
    return new Date(monthString + '-01').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
}

// Show message
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}
