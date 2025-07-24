// Account enquiry functionality
let selectedCustomer = null;
let currentAccountNumber = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupNavigation();
    loadRecentAccounts();
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

// Search for customers
function searchCustomerForAccount() {
    const searchQuery = document.getElementById('customerSearchInput').value.trim().toLowerCase();
    
    if (!searchQuery) {
        alert('Please enter a search term');
        return;
    }

    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const matchingCustomers = customers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchQuery) ||
        customer.lastName.toLowerCase().includes(searchQuery) ||
        customer.id.toLowerCase().includes(searchQuery) ||
        (customer.phone || '').toLowerCase().includes(searchQuery)
    );

    displaySearchResults(matchingCustomers);
}

// Display search results
function displaySearchResults(customers) {
    const searchResults = document.getElementById('searchResults');
    const customerResults = document.getElementById('customerResults');

    if (customers.length === 0) {
        customerResults.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No customers found matching your search.</p>';
        searchResults.style.display = 'block';
        return;
    }

    let html = '';
    customers.forEach(customer => {
        html += `
            <div class="customer-result" style="border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: all 0.3s ease;" onclick="selectCustomer('${customer.id}')">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${customer.firstName} ${customer.lastName}</h4>
                        <p style="margin: 0; color: #6c757d; font-size: 0.9rem;">ID: ${customer.id} | Phone: ${customer.phone || 'N/A'}</p>
                        <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 0.9rem;">Hometown: ${customer.hometown}</p>
                    </div>
                    <button class="btn-primary" style="width: auto; padding: 8px 15px; font-size: 0.9rem;">Select</button>
                </div>
            </div>
        `;
    });

    customerResults.innerHTML = html;
    searchResults.style.display = 'block';
}

// Select a customer for account creation
function selectCustomer(customerId) {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    selectedCustomer = customers.find(customer => customer.id === customerId);

    if (!selectedCustomer) {
        alert('Customer not found');
        return;
    }

    // Display selected customer info
    const customerInfo = document.getElementById('selectedCustomerInfo');
    customerInfo.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Selected Customer</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <strong>Name:</strong> ${selectedCustomer.firstName} ${selectedCustomer.lastName}
            </div>
            <div>
                <strong>Customer ID:</strong> ${selectedCustomer.id}
            </div>
            <div>
                <strong>Gender:</strong> ${selectedCustomer.gender}
            </div>
            <div>
                <strong>Phone:</strong> ${selectedCustomer.phone || 'N/A'}
            </div>
            <div>
                <strong>Hometown:</strong> ${selectedCustomer.hometown}
            </div>
            <div>
                <strong>Citizenship:</strong> ${selectedCustomer.citizenship}
            </div>
        </div>
    `;

    // Show account generation section
    document.getElementById('accountSection').style.display = 'block';
    
    // Reset form
    document.getElementById('accountType').selectedIndex = 0;
    document.getElementById('initialDeposit').value = '';
    document.getElementById('generatedAccountNumber').className = 'account-number';
    document.getElementById('generatedAccountNumber').innerHTML = '<span class="account-placeholder">Click "Generate Account" to create account number</span>';
    document.getElementById('createAccountBtn').disabled = true;
    currentAccountNumber = null;
}

// Generate random account number
function generateAccountNumber() {
    if (!selectedCustomer) {
        alert('Please select a customer first');
        return;
    }

    // Generate 10-digit alphanumeric account number
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let accountNumber = '';
    
    for (let i = 0; i < 10; i++) {
        accountNumber += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if account number already exists
    const existingAccounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const accountExists = existingAccounts.some(account => account.accountNumber === accountNumber);
    
    if (accountExists) {
        // If account number exists, generate a new one
        generateAccountNumber();
        return;
    }

    currentAccountNumber = accountNumber;
    
    // Display generated account number
    const accountNumberDisplay = document.getElementById('generatedAccountNumber');
    accountNumberDisplay.className = 'account-number generated';
    accountNumberDisplay.textContent = accountNumber;
    
    // Enable create account button
    document.getElementById('createAccountBtn').disabled = false;
}

// Create account
function createAccount() {
    if (!selectedCustomer || !currentAccountNumber) {
        alert('Please select a customer and generate an account number');
        return;
    }

    const accountType = document.getElementById('accountType').value;
    const initialDeposit = parseFloat(document.getElementById('initialDeposit').value) || 0;

    if (!accountType) {
        alert('Please select an account type');
        return;
    }

    const accountData = {
        accountNumber: currentAccountNumber,
        customerId: selectedCustomer.id,
        customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        accountType: accountType,
        initialDeposit: initialDeposit,
        balance: initialDeposit,
        dateCreated: new Date().toISOString(),
        status: 'active'
    };

    // Get existing accounts or create empty array
    const existingAccounts = JSON.parse(localStorage.getItem('accounts')) || [];
    
    // Add new account
    existingAccounts.push(accountData);
    
    // Save to localStorage
    localStorage.setItem('accounts', JSON.stringify(existingAccounts));

    // Add initial deposit transaction if any
    if (initialDeposit > 0) {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transactions.push({
            id: Date.now(),
            accountNumber: currentAccountNumber,
            customerId: selectedCustomer.id,
            type: 'deposit',
            amount: initialDeposit,
            description: 'Initial deposit',
            date: new Date().toISOString().split('T')[0],
            dateCreated: new Date().toISOString()
        });
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // Show success message
    alert(`Account created successfully!\nAccount Number: ${currentAccountNumber}\nAccount Type: ${accountType}\nInitial Deposit: ₵${initialDeposit.toFixed(2)}`);

    // Clear form and refresh recent accounts
    clearAccountSection();
    loadRecentAccounts();
}

// Clear account section
function clearAccountSection() {
    selectedCustomer = null;
    currentAccountNumber = null;
    
    document.getElementById('accountSection').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('customerSearchInput').value = '';
    document.getElementById('accountType').selectedIndex = 0;
    document.getElementById('initialDeposit').value = '';
    document.getElementById('generatedAccountNumber').className = 'account-number';
    document.getElementById('generatedAccountNumber').innerHTML = '<span class="account-placeholder">Click "Generate Account" to create account number</span>';
    document.getElementById('createAccountBtn').disabled = true;
}

// Load recent accounts
function loadRecentAccounts() {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const recentAccountsBody = document.getElementById('recentAccountsBody');

    if (accounts.length === 0) {
        recentAccountsBody.innerHTML = '<tr class="no-data-row"><td colspan="5">No accounts created yet</td></tr>';
        return;
    }

    // Sort by creation date (most recent first) and take last 10
    const sortedAccounts = accounts.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)).slice(0, 10);

    let html = '';
    sortedAccounts.forEach(account => {
        const createdDate = new Date(account.dateCreated).toLocaleDateString();
        html += `
            <tr>
                <td style="font-family: 'Courier New', monospace; font-weight: bold; color: #27ae60;">${account.accountNumber}</td>
                <td>${account.customerName}</td>
                <td>${account.accountType}</td>
                <td>₵${account.initialDeposit.toFixed(2)}</td>
                <td>${createdDate}</td>
            </tr>
        `;
    });

    recentAccountsBody.innerHTML = html;
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

    // Search on Enter key
    document.getElementById('customerSearchInput').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchCustomerForAccount();
        }
    });
}
