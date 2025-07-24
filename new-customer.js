// New customer registration functionality
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    populateYearDropdown();
    populateDayDropdown();
    setupFormValidation();
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

// Populate year dropdown with years from 1950 to current year
function populateYearDropdown() {
    const yearSelect = document.getElementById('birthYear');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Populate day dropdown based on selected month and year
function populateDayDropdown() {
    const monthSelect = document.getElementById('birthMonth');
    const yearSelect = document.getElementById('birthYear');
    const daySelect = document.getElementById('birthDay');

    function updateDays() {
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        
        // Clear existing options except the first one
        daySelect.innerHTML = '<option value="">Day</option>';
        
        if (month && year) {
            const daysInMonth = new Date(year, month, 0).getDate();
            
            for (let day = 1; day <= daysInMonth; day++) {
                const option = document.createElement('option');
                option.value = day.toString().padStart(2, '0');
                option.textContent = day;
                daySelect.appendChild(option);
            }
        }
    }

    monthSelect.addEventListener('change', updateDays);
    yearSelect.addEventListener('change', updateDays);
}

// Setup form validation and submission
function setupFormValidation() {
    const form = document.getElementById('newCustomerForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            saveCustomer();
        }
    });
}

// Validate form data
function validateForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const gender = document.getElementById('gender').value;
    const birthYear = document.getElementById('birthYear').value;
    const birthMonth = document.getElementById('birthMonth').value;
    const birthDay = document.getElementById('birthDay').value;
    const citizenship = document.getElementById('citizenship').value;
    const maritalStatus = document.getElementById('maritalStatus').value;
    const hometown = document.getElementById('hometown').value.trim();

    // Clear previous error styling
    document.querySelectorAll('.form-group input, .form-group select').forEach(element => {
        element.classList.remove('error');
    });

    let isValid = true;
    let errors = [];

    if (!firstName) {
        document.getElementById('firstName').classList.add('error');
        errors.push('First name is required');
        isValid = false;
    }

    if (!lastName) {
        document.getElementById('lastName').classList.add('error');
        errors.push('Last name is required');
        isValid = false;
    }

    if (!gender) {
        document.getElementById('gender').classList.add('error');
        errors.push('Gender is required');
        isValid = false;
    }

    if (!birthYear || !birthMonth || !birthDay) {
        document.getElementById('birthYear').classList.add('error');
        document.getElementById('birthMonth').classList.add('error');
        document.getElementById('birthDay').classList.add('error');
        errors.push('Complete date of birth is required');
        isValid = false;
    }

    if (!citizenship) {
        document.getElementById('citizenship').classList.add('error');
        errors.push('Citizenship is required');
        isValid = false;
    }

    if (!maritalStatus) {
        document.getElementById('maritalStatus').classList.add('error');
        errors.push('Marital status is required');
        isValid = false;
    }

    if (!hometown) {
        document.getElementById('hometown').classList.add('error');
        errors.push('Hometown is required');
        isValid = false;
    }

    if (!isValid) {
        alert('Please fill in all required fields:\n' + errors.join('\n'));
    }

    return isValid;
}

// Save customer data
function saveCustomer() {
    const customerData = {
        id: generateCustomerId(),
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        gender: document.getElementById('gender').value,
        dateOfBirth: `${document.getElementById('birthYear').value}-${document.getElementById('birthMonth').value}-${document.getElementById('birthDay').value}`,
        citizenship: document.getElementById('citizenship').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        hometown: document.getElementById('hometown').value.trim(),
        phone: document.getElementById('phoneNumber').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        dateCreated: new Date().toISOString()
    };

    // Get existing customers or create empty array
    const existingCustomers = JSON.parse(localStorage.getItem('customers')) || [];
    
    // Add new customer
    existingCustomers.push(customerData);
    
    // Save to localStorage
    localStorage.setItem('customers', JSON.stringify(existingCustomers));

    // Show success message and redirect
    alert(`Customer registered successfully!\nCustomer ID: ${customerData.id}`);
    window.location.href = 'individual-customers.html';
}

// Generate unique customer ID
function generateCustomerId() {
    const existingCustomers = JSON.parse(localStorage.getItem('customers')) || [];
    const existingIds = existingCustomers.map(c => c.id);
    
    let newId;
    do {
        // Generate ID in format CUS001, CUS002, etc.
        const number = (existingCustomers.length + 1).toString().padStart(3, '0');
        newId = `CUS${number}`;
    } while (existingIds.includes(newId));
    
    return newId;
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
