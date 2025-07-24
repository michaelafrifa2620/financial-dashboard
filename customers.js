// Individual customers functionality
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupSearch();
    displayCustomers();
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

// Setup customer search functionality
function setupSearch() {
    const searchInput = document.getElementById('customerSearch');
    const searchButton = document.querySelector('.search-btn');

    searchButton.addEventListener('click', function() {
        const query = searchInput.value.toLowerCase();
        filterCustomers(query);
    });

    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterCustomers(searchInput.value.toLowerCase());
        }
    });
}

// Display all customers
function displayCustomers(customers = null) {
    const customersTableBody = document.getElementById('customersTableBody');
    const allCustomers = customers || JSON.parse(localStorage.getItem('customers')) || [];

    let html = '';

    if (allCustomers.length === 0) {
        html = '<tr class="no-data-row"><td colspan="7">No customers found. Click "New Customer" to add one.</td></tr>';
    } else {
        allCustomers.forEach(customer => {
            html += `
                <tr>
                    <td>${customer.id}</td>
                    <td>${customer.firstName} ${customer.lastName}</td>
                    <td>${customer.gender}</td>
                    <td>${customer.dateOfBirth}</td>
                    <td>${customer.phone || 'N/A'}</td>
                    <td>${customer.hometown}</td>
                    <td><button class="view-btn">View</button></td>
                </tr>
            `;
        });
    }

    customersTableBody.innerHTML = html;
    document.getElementById('customerCount').textContent = `Total: ${allCustomers.length} customers`;
}

// Filter customers based on search query
function filterCustomers(query) {
    const allCustomers = JSON.parse(localStorage.getItem('customers')) || [];
    const filteredCustomers = allCustomers.filter(customer => 
        customer.firstName.toLowerCase().includes(query) ||
        customer.lastName.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query) ||
        (customer.phone || '').toLowerCase().includes(query)
    );
    displayCustomers(filteredCustomers);
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

