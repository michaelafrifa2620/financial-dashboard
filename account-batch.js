// Excel-like Account Batch functionality
let currentActiveCell = null;
let currentRowIndex = 0;
let batchEntries = [];
let searchModalOpen = false;
let targetInputField = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupNavigation();
    initializeBatchTable();
    setupKeyboardEvents();
    loadBatchHistory();
    updateCurrentDate();
    
    // Initialize customer data
    initializeCustomerData();
    
    // Debug: Show customer count in console
    console.log('Customer data loaded:', getCustomersData());
});

// Initialize customer data
function initializeCustomerData() {
    // Force creation of customer data if it doesn't exist
    const customers = getCustomersData();
    console.log('Initialized customers:', customers.length);
}

// Check if user is authenticated - bypassed for testing
function checkAuthentication() {
    // Set demo user for testing
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', 'Demo User');
    
    // Display current user
    const userElement = document.getElementById('currentUser');
    if (userElement) {
        userElement.textContent = `Welcome, Demo User`;
    }
}

// Update current date
function updateCurrentDate() {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = dateString;
}

// Initialize the batch table with first row
function initializeBatchTable() {
    addNewRow();
}

// Add new row to the batch entry table
function addNewRow() {
    currentRowIndex++;
    const tbody = document.getElementById('batchEntryBody');
    
    const row = document.createElement('tr');
    row.dataset.rowIndex = currentRowIndex;
    row.innerHTML = `
        <td class="line-number">${currentRowIndex}</td>
        <td>
            <input type="text" class="excel-input customer-name" 
                   data-field="customerName" data-row="${currentRowIndex}"
                   placeholder="Search customer name..." />
        </td>
        <td>
            <input type="text" class="excel-input account-number" 
                   data-field="accountNumber" data-row="${currentRowIndex}"
                   readonly style="background-color: #f5f5f5;" />
        </td>
        <td>
            <input type="text" class="excel-input account-name" 
                   data-field="accountName" data-row="${currentRowIndex}"
                   readonly style="background-color: #f5f5f5;" />
        </td>
        <td>
            <input type="number" class="excel-input deposit-amount" 
                   data-field="depositAmount" data-row="${currentRowIndex}"
                   placeholder="0.00" step="0.01" min="0" />
        </td>
        <td>
            <input type="text" class="excel-input current-balance" 
                   data-field="currentBalance" data-row="${currentRowIndex}"
                   readonly style="background-color: #f5f5f5;" />
        </td>
        <td>
            <button class="btn-danger btn-small" onclick="removeRow(${currentRowIndex})">×</button>
        </td>
    `;
    
    tbody.appendChild(row);
    setupRowEvents(row);
    updateTotalEntries();
    
    // Focus on the customer name field of the new row
    const customerNameInput = row.querySelector('.customer-name');
    customerNameInput.focus();
}

// Setup events for a specific row
function setupRowEvents(row) {
    const inputs = row.querySelectorAll('.excel-input');
    
    inputs.forEach(input => {
        // Focus events
        input.addEventListener('focus', function() {
            currentActiveCell = this;
            this.classList.add('active-cell');
        });
        
        input.addEventListener('blur', function() {
            this.classList.remove('active-cell');
        });
        
        // Tab navigation
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                navigateToNextCell(this, e.shiftKey);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const nextRow = this.closest('tr').nextElementSibling;
                if (!nextRow) {
                    addNewRow();
                } else {
                    const sameFieldInNextRow = nextRow.querySelector(`[data-field="${this.dataset.field}"]`);
                    if (sameFieldInNextRow) {
                        sameFieldInNextRow.focus();
                    }
                }
            }
        });
        
        // Deposit amount change event
        if (input.classList.contains('deposit-amount')) {
            input.addEventListener('input', function() {
                updateBalance(this);
            });
        }
    });
}

// Navigate to next/previous cell
function navigateToNextCell(currentInput, goBackward = false) {
    const allInputs = Array.from(document.querySelectorAll('.excel-input:not([readonly])'));
    const currentIndex = allInputs.indexOf(currentInput);
    
    let nextIndex;
    if (goBackward) {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : allInputs.length - 1;
    } else {
        nextIndex = currentIndex < allInputs.length - 1 ? currentIndex + 1 : 0;
    }
    
    if (allInputs[nextIndex]) {
        allInputs[nextIndex].focus();
    }
}

// Setup global keyboard events
function setupKeyboardEvents() {
    document.addEventListener('keydown', function(e) {
        // Debug: Log all key presses
        console.log('Key pressed:', e.key, 'KeyCode:', e.keyCode, 'Which:', e.which);
        
        // F2 key for customer search (multiple detection methods)
        if (e.key === 'F2' || e.keyCode === 113 || e.which === 113) {
            e.preventDefault();
            console.log('F2 detected! Opening customer search...');
            
            if (currentActiveCell && currentActiveCell.classList.contains('customer-name')) {
                console.log('Opening search for active customer cell');
                openCustomerSearch(currentActiveCell);
            } else {
                // If no active cell or not a customer name field, focus on first customer name field
                const firstCustomerField = document.querySelector('.customer-name');
                if (firstCustomerField) {
                    console.log('Focusing first customer field and opening search');
                    firstCustomerField.focus();
                    openCustomerSearch(firstCustomerField);
                } else {
                    console.log('No customer field found!');
                }
            }
        }
        
        // Escape key to close modal
        if (e.key === 'Escape' && searchModalOpen) {
            closeSearchModal();
        }
    });
}

// Test F2 Search function (manual trigger)
function testF2Search() {
    console.log('Manual F2 search test triggered');
    const firstCustomerField = document.querySelector('.customer-name');
    if (firstCustomerField) {
        firstCustomerField.focus();
        openCustomerSearch(firstCustomerField);
    } else {
        alert('No customer field found!');
    }
}

// Open customer search modal
function openCustomerSearch(inputField) {
    targetInputField = inputField;
    const modal = document.getElementById('customerSearchModal');
    modal.style.display = 'block';
    searchModalOpen = true;
    
    // Focus on search input
    const searchInput = document.getElementById('customerSearchInput');
    searchInput.value = '';
    searchInput.focus();
    
    // Clear previous results
    document.getElementById('searchResultsBody').innerHTML = `
        <tr class="no-results">
            <td colspan="5">Start typing to search customers...</td>
        </tr>
    `;
}

// Close customer search modal
function closeSearchModal() {
    const modal = document.getElementById('customerSearchModal');
    modal.style.display = 'none';
    searchModalOpen = false;
    targetInputField = null;
}

// Search customers
function searchCustomers() {
    const searchTerm = document.getElementById('customerSearchInput').value.toLowerCase();
    const resultsBody = document.getElementById('searchResultsBody');
    
    if (searchTerm.length < 2) {
        resultsBody.innerHTML = `
            <tr class="no-results">
                <td colspan="5">Type at least 2 characters to search...</td>
            </tr>
        `;
        return;
    }
    
    // Get customers from localStorage (mock data for demo)
    const customers = getCustomersData();
    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        customer.accountNumber.includes(searchTerm)
    );
    
    if (filteredCustomers.length === 0) {
        resultsBody.innerHTML = `
            <tr class="no-results">
                <td colspan="5">No customers found matching "${searchTerm}"</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filteredCustomers.forEach(customer => {
        html += `
            <tr class="search-result-row" onclick="selectCustomer('${customer.id}')">
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.accountNumber}</td>
                <td>₵${customer.balance.toFixed(2)}</td>
                <td>
                    <button class="btn-primary btn-small" onclick="selectCustomer('${customer.id}')">
                        Select
                    </button>
                </td>
            </tr>
        `;
    });
    
    resultsBody.innerHTML = html;
}

// Select customer from search results
function selectCustomer(customerId) {
    const customers = getCustomersData();
    const customer = customers.find(c => c.id === customerId);
    
    if (customer && targetInputField) {
        const row = targetInputField.closest('tr');
        const rowIndex = targetInputField.dataset.row;
        
        // Fill customer details
        targetInputField.value = customer.name;
        row.querySelector('.account-number').value = customer.accountNumber;
        row.querySelector('.account-name').value = customer.accountName;
        row.querySelector('.current-balance').value = `₵${customer.balance.toFixed(2)}`;
        
        // Store customer data for this row
        if (!batchEntries[rowIndex]) {
            batchEntries[rowIndex] = {};
        }
        batchEntries[rowIndex].customer = customer;
        
        closeSearchModal();
        
        // Focus on deposit amount field
        const depositField = row.querySelector('.deposit-amount');
        if (depositField) {
            depositField.focus();
        }
    }
}

// Update balance when deposit amount changes
function updateBalance(depositInput) {
    const row = depositInput.closest('tr');
    const rowIndex = depositInput.dataset.row;
    const currentBalanceField = row.querySelector('.current-balance');
    
    if (batchEntries[rowIndex] && batchEntries[rowIndex].customer) {
        const customer = batchEntries[rowIndex].customer;
        const depositAmount = parseFloat(depositInput.value) || 0;
        const newBalance = customer.balance + depositAmount;
        
        currentBalanceField.value = `₵${newBalance.toFixed(2)}`;
        
        // Store the updated balance
        batchEntries[rowIndex].newBalance = newBalance;
        batchEntries[rowIndex].depositAmount = depositAmount;
    }
}

// Remove a row
function removeRow(rowIndex) {
    const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
    if (row) {
        row.remove();
        delete batchEntries[rowIndex];
        updateTotalEntries();
    }
}

// Update total entries count
function updateTotalEntries() {
    const totalRows = document.querySelectorAll('#batchEntryBody tr').length;
    document.getElementById('totalEntries').textContent = totalRows;
}

// Save batch entries
function saveBatch() {
    const validEntries = [];
    
    // Validate all entries
    Object.keys(batchEntries).forEach(rowIndex => {
        const entry = batchEntries[rowIndex];
        if (entry.customer && entry.depositAmount > 0) {
            validEntries.push({
                customerId: entry.customer.id,
                customerName: entry.customer.name,
                accountNumber: entry.customer.accountNumber,
                accountName: entry.customer.accountName,
                depositAmount: entry.depositAmount,
                previousBalance: entry.customer.balance,
                newBalance: entry.newBalance,
                timestamp: new Date().toISOString(),
                status: 'completed'
            });
        }
    });
    
    if (validEntries.length === 0) {
        alert('No valid entries to save. Please add customer details and deposit amounts.');
        return;
    }
    
    // Save to localStorage
    const existingBatches = JSON.parse(localStorage.getItem('batchTransactions')) || [];
    const batchId = Date.now();
    
    validEntries.forEach(entry => {
        entry.batchId = batchId;
        existingBatches.push(entry);
        
        // Update customer balance in customers data
        updateCustomerBalance(entry.customerId, entry.newBalance);
    });
    
    localStorage.setItem('batchTransactions', JSON.stringify(existingBatches));
    
    alert(`Batch saved successfully! ${validEntries.length} transactions processed.`);
    
    // Clear the table and refresh
    clearBatch();
    loadBatchHistory();
}

// Clear batch entries
function clearBatch() {
    document.getElementById('batchEntryBody').innerHTML = '';
    batchEntries = [];
    currentRowIndex = 0;
    addNewRow();
}

// Update customer balance in accounts system
function updateCustomerBalance(customerId, newBalance) {
    // Update the account balance in the accounts system
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const accountIndex = accounts.findIndex(account => account.customerId === customerId);
    
    if (accountIndex !== -1) {
        accounts[accountIndex].balance = newBalance;
        localStorage.setItem('accounts', JSON.stringify(accounts));
        console.log(`Updated account balance for customer ${customerId} to ₵${newBalance}`);
    } else {
        console.log(`No account found for customer ${customerId}`);
    }
}

// Load batch transaction history
function loadBatchHistory() {
    const historyBody = document.getElementById('batchHistoryBody');
    const transactions = JSON.parse(localStorage.getItem('batchTransactions')) || [];
    
    if (transactions.length === 0) {
        historyBody.innerHTML = `
            <tr class="no-data-row">
                <td colspan="7">No transaction history available.</td>
            </tr>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let html = '';
    transactions.forEach(transaction => {
        const date = new Date(transaction.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        html += `
            <tr>
                <td>${formattedDate}</td>
                <td>${transaction.customerName}</td>
                <td>${transaction.accountNumber}</td>
                <td>${transaction.accountName}</td>
                <td>₵${transaction.depositAmount.toFixed(2)}</td>
                <td>₵${transaction.newBalance.toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${transaction.status}">
                        ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                </td>
            </tr>
        `;
    });
    
    historyBody.innerHTML = html;
}

// Get customers data (from real customer file and accounts)
function getCustomersData() {
    // Get real customers from the new-customer system
    let realCustomers = JSON.parse(localStorage.getItem('customers')) || [];
    // Get actual accounts from account enquiry system
    let realAccounts = JSON.parse(localStorage.getItem('accounts')) || [];
    
    // Convert real customer data to batch format
    let customers = [];
    
    // First, get customers who have actual accounts
    realAccounts.forEach(account => {
        const customer = realCustomers.find(c => c.id === account.customerId);
        if (customer) {
            customers.push({
                id: customer.id,
                name: `${customer.firstName} ${customer.lastName}`,
                phone: customer.phone || 'N/A',
                accountNumber: account.accountNumber, // Use the real account number
                accountName: `${customer.firstName} ${customer.lastName} - ${account.accountType}`,
                balance: account.balance || 0.00
            });
        }
    });
    
    // Then, add customers without accounts (for account creation)
    realCustomers.forEach(customer => {
        // Check if customer already has an account
        const hasAccount = customers.some(c => c.id === customer.id);
        if (!hasAccount) {
            customers.push({
                id: customer.id,
                name: `${customer.firstName} ${customer.lastName}`,
                phone: customer.phone || 'N/A',
                accountNumber: 'NO_ACCOUNT', // Indicates no account created yet
                accountName: `${customer.firstName} ${customer.lastName} - No Account`,
                balance: 0.00,
                noAccount: true // Flag to indicate no account
            });
        }
    });
    
    // If no real customers exist, add a few sample ones for demo
    if (customers.length === 0) {
        customers = generateSampleCustomers();
        console.log('No real customers found, using sample data');
    } else {
        console.log(`Found ${customers.length} customers (${realAccounts.length} with accounts, ${realCustomers.length - realAccounts.length} without accounts)`);
    }
    
    return customers;
}

// Generate account number based on customer ID
function generateAccountNumber(customerId) {
    // Convert customer ID (like CUS001) to account number (like ACC001)
    if (customerId.startsWith('CUS')) {
        return customerId.replace('CUS', 'ACC');
    }
    return `ACC${customerId.padStart(3, '0')}`;
}

// Get customer balance (starts at 0 for new customers)
function getCustomerBalance(customerId) {
    // Check if customer has any previous transactions
    const transactions = JSON.parse(localStorage.getItem('batchTransactions')) || [];
    const customerTransactions = transactions.filter(t => t.customerId === customerId);
    
    if (customerTransactions.length === 0) {
        return 0.00; // New customer starts with 0 balance
    }
    
    // Get the latest transaction balance
    const latestTransaction = customerTransactions.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    )[0];
    
    return latestTransaction.newBalance || 0.00;
}

// Generate sample customers for demo
function generateSampleCustomers() {
    return [
        {
            id: '1',
            name: 'John Kwame Asante',
            phone: '+233244123456',
            accountNumber: 'ACC001',
            accountName: 'John Kwame Asante - Savings',
            balance: 1500.00
        },
        {
            id: '2',
            name: 'Mary Akosua Osei',
            phone: '+233277987654',
            accountNumber: 'ACC002',
            accountName: 'Mary Akosua Osei - Current',
            balance: 2800.50
        },
        {
            id: '3',
            name: 'Peter Yaw Mensah',
            phone: '+233244555777',
            accountNumber: 'ACC003',
            accountName: 'Peter Yaw Mensah - Savings',
            balance: 950.75
        },
        {
            id: '4',
            name: 'Grace Ama Boateng',
            phone: '+233208888999',
            accountNumber: 'ACC004',
            accountName: 'Grace Ama Boateng - Fixed',
            balance: 5000.00
        },
        {
            id: '5',
            name: 'Samuel Kofi Darko',
            phone: '+233266111222',
            accountNumber: 'ACC005',
            accountName: 'Samuel Kofi Darko - Business',
            balance: 3200.25
        }
    ];
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

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('customerSearchModal');
        if (e.target === modal) {
            closeSearchModal();
        }
    });
}
