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

// Fetch all customers from API and display them
function displayCustomers(customers = null) {
    if (customers) {
        renderCustomers(customers);
    } else {
        fetch('api/customers.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderCustomers(data.data);
                } else {
                    alert('Failed to fetch customers: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error fetching customers:', error);
                alert('Error fetching customers');
            });
    }
}

function renderCustomers(customers) {
    const customersTableBody = document.getElementById('customersTableBody');
    if (!customers || customers.length === 0) {
        customersTableBody.innerHTML = '<tr class="no-data-row"><td colspan="7">No customers found. Click "New Customer" to add one.</td></tr>';
        document.getElementById('customerCount').textContent = 'Total: 0 customers';
        return;
    }

    let html = '';
    customers.forEach(customer => {
        const firstName = customer.first_name || '';
        const lastName = customer.last_name || '';
        const dateOfBirth = customer.date_of_birth || '';
        const phone = customer.phone || 'N/A';
        const hometown = customer.hometown || '';
        html += `
            <tr>
                <td>${customer.id}</td>
                <td>${firstName} ${lastName}</td>
                <td>${customer.gender}</td>
                <td>${dateOfBirth}</td>
                <td>${phone}</td>
                <td>${hometown}</td>
                <td><button class="view-btn" onclick="viewCustomer('${customer.id}')">View</button></td>
            </tr>
        `;
    });
    customersTableBody.innerHTML = html;
    document.getElementById('customerCount').textContent = `Total: ${customers.length} customers`;
}

// Filter customers based on search query
function filterCustomers(query) {
    if (!query) {
        displayCustomers();
        return;
    }
    
    fetch(`api/customers.php?search=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderCustomers(data.data);
            } else {
                renderCustomers([]);
            }
        })
        .catch(error => {
            console.error('Error searching customers:', error);
            renderCustomers([]);
        });
}

// Global variables for modal functionality
let currentCustomerId = null;
let isEditMode = false;
let originalCustomerData = null;

// View customer details fetched from API
function viewCustomer(customerId) {
    fetch(`api/customers.php?id=${encodeURIComponent(customerId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const customer = data.data;
                currentCustomerId = customer.id;
                originalCustomerData = {...customer};

                document.getElementById('editCustomerId').value = customer.id;
                document.getElementById('editDateCreated').value = formatDate(customer.date_created);
                document.getElementById('editFirstName').value = customer.first_name;
                document.getElementById('editLastName').value = customer.last_name;
                document.getElementById('editGender').value = customer.gender;
                document.getElementById('editMaritalStatus').value = customer.marital_status;
                document.getElementById('editDateOfBirth').value = customer.date_of_birth;
                document.getElementById('editCitizenship').value = customer.citizenship;
                document.getElementById('editPhone').value = customer.phone || '';
                document.getElementById('editEmail').value = customer.email || '';
                document.getElementById('editHometown').value = customer.hometown;
                document.getElementById('editAddress').value = customer.address || '';

                document.getElementById('modalTitle').textContent = `Customer Details - ${customer.first_name} ${customer.last_name}`;
                document.getElementById('customerDetailsModal').style.display = 'block';

                setViewMode();
            } else {
                alert('Customer not found or error loading customer data.');
            }
        })
        .catch(error => {
            console.error('Failed to load customer:', error);
            alert('Failed to load customer details.');
        });
}

// Close customer modal
function closeCustomerModal() {
    document.getElementById('customerDetailsModal').style.display = 'none';
    currentCustomerId = null;
    isEditMode = false;
    originalCustomerData = null;
}

// Toggle edit mode
function toggleEditMode() {
    if (!isEditMode) {
        setEditMode();
    }
}

// Set view mode (read-only)
function setViewMode() {
    isEditMode = false;
    const formInputs = document.querySelectorAll('#customerDetailsForm input:not([readonly]), #customerDetailsForm select, #customerDetailsForm textarea');
    formInputs.forEach(input => {
        input.disabled = true;
    });
    
    // Show/hide buttons
    document.querySelector('button[onclick="toggleEditMode()"]').style.display = 'inline-block';
    document.getElementById('saveCustomerBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

// Set edit mode (editable)
function setEditMode() {
    isEditMode = true;
    const formInputs = document.querySelectorAll('#customerDetailsForm input:not([readonly]), #customerDetailsForm select, #customerDetailsForm textarea');
    formInputs.forEach(input => {
        input.disabled = false;
    });
    
    // Show/hide buttons
    document.querySelector('button[onclick="toggleEditMode()"]').style.display = 'none';
    document.getElementById('saveCustomerBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
}

// Cancel edit and restore original data
function cancelEdit() {
    if (originalCustomerData) {
        // Restore original values using API field names
        document.getElementById('editFirstName').value = originalCustomerData.first_name;
        document.getElementById('editLastName').value = originalCustomerData.last_name;
        document.getElementById('editGender').value = originalCustomerData.gender;
        document.getElementById('editMaritalStatus').value = originalCustomerData.marital_status;
        document.getElementById('editDateOfBirth').value = originalCustomerData.date_of_birth;
        document.getElementById('editCitizenship').value = originalCustomerData.citizenship;
        document.getElementById('editPhone').value = originalCustomerData.phone || '';
        document.getElementById('editEmail').value = originalCustomerData.email || '';
        document.getElementById('editHometown').value = originalCustomerData.hometown;
        document.getElementById('editAddress').value = originalCustomerData.address || '';
    }
    setViewMode();
}

// Save updated customer details via API PUT call
function saveCustomerChanges() {
    // Validate required fields
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const gender = document.getElementById('editGender').value;
    const maritalStatus = document.getElementById('editMaritalStatus').value;
    const dateOfBirth = document.getElementById('editDateOfBirth').value;
    const citizenship = document.getElementById('editCitizenship').value;
    const hometown = document.getElementById('editHometown').value.trim();

    if (!firstName || !lastName || !gender || !maritalStatus || !dateOfBirth || !citizenship || !hometown) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }

    const customerData = {
        first_name: firstName,
        last_name: lastName,
        gender: gender,
        marital_status: maritalStatus,
        date_of_birth: dateOfBirth,
        citizenship: citizenship,
        phone: document.getElementById('editPhone').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        hometown: hometown,
        address: document.getElementById('editAddress').value.trim(),
    };

    fetch(`api/customers.php?id=${encodeURIComponent(currentCustomerId)}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(customerData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Customer details updated successfully!');
                setViewMode();
                displayCustomers();
                originalCustomerData = {...customerData, id: currentCustomerId};
            } else {
                alert('Failed to update customer: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error updating customer:', error);
            alert('Error updating customer details.');
        });
}

// Delete customer via API DELETE call
function deleteCustomer() {
    if (!currentCustomerId) {
        alert('No customer selected!');
        return;
    }

    if (!confirm(`Are you sure you want to delete this customer? This action cannot be undone.`)) {
        return;
    }

    fetch(`api/customers.php?id=${encodeURIComponent(currentCustomerId)}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Customer deleted successfully!');
                closeCustomerModal();
                displayCustomers();
            } else {
                alert('Failed to delete customer: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error deleting customer:', error);
            alert('Error deleting customer.');
        });
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
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

