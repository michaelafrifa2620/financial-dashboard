// Dashboard functionality for Afrifa Susu Enterprise
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeDashboard();
    setupNavigation();
});

// Check if user is authenticated
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display current user
    document.getElementById('currentUser').textContent = `Welcome, ${currentUser}`;
}

// Initialize dashboard
function initializeDashboard() {
    // Set current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = currentDate;
    
    // Load dashboard data
    loadDashboardStats();
    loadRecentActivities();
}

// Setup navigation
function setupNavigation() {
    // Sign out functionality
    document.getElementById('signOutBtn').addEventListener('click', function() {
        localStorage.clear();
        window.location.href = 'index.html';
    });
    
    // Dropdown functionality
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.parentElement;
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                }
            });
            
            // Toggle current dropdown
            dropdownMenu.classList.toggle('show');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// Load dashboard statistics
function loadDashboardStats() {
    // Get data from localStorage or use defaults
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Update statistics
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('activeAccounts').textContent = accounts.length;
    
    // Calculate total deposits
    const totalDeposits = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    document.getElementById('totalDeposits').textContent = `₵${totalDeposits.toFixed(2)}`;
    
    // Today's transactions
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === today);
    document.getElementById('todayTransactions').textContent = todayTransactions.length;
}

// Load recent activities
function loadRecentActivities() {
    const activitiesContainer = document.getElementById('recentActivities');
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    
    let activities = [];
    
    // Add recent customer registrations
    customers.slice(-3).forEach(customer => {
        activities.push({
            text: `New customer registered: ${customer.firstName} ${customer.lastName}`,
            time: customer.dateCreated || new Date().toISOString(),
            icon: '👤'
        });
    });
    
    // Add recent account creations
    accounts.slice(-3).forEach(account => {
        activities.push({
            text: `New account created: ${account.accountNumber}`,
            time: account.dateCreated || new Date().toISOString(),
            icon: '🏦'
        });
    });
    
    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    if (activities.length === 0) {
        activitiesContainer.innerHTML = '<p class="no-data">No recent activities</p>';
        return;
    }
    
    let html = '';
    activities.slice(0, 5).forEach(activity => {
        html += `
            <div class="activity-item" style="display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
                <span style="font-size: 1.2rem;">${activity.icon}</span>
                <div>
                    <div style="font-size: 0.9rem; color: #495057;">${activity.text}</div>
                    <div style="font-size: 0.8rem; color: #6c757d;">${formatTime(activity.time)}</div>
                </div>
            </div>
        `;
    });
    
    activitiesContainer.innerHTML = html;
}

// Format time for display
function formatTime(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Update current date every hour
setInterval(function() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = currentDate;
}, 3600000); // Update every hour
