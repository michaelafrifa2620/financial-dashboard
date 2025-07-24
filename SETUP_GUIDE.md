# Financial Dashboard Setup Guide

## Next Steps to Get Your Application Running

### 1. Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install it on your computer
3. Start Apache and MySQL services from XAMPP Control Panel

### 2. Setup Database
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create a new database called `financial_dashboard`
3. Import the SQL file: `database/setup.sql`

### 3. Move Files to XAMPP
1. Copy your entire `financial_dashboard` folder to:
   - `C:\xampp\htdocs\financial_dashboard`

### 4. Test the Application
1. Open browser and go to: `http://localhost/financial_dashboard`
2. You should see the login page

### 5. Create Your First Account
1. Click "Register here"
2. Fill in your details (First Name, Last Name, Email, Password)
3. Click "Register"
4. Then login with your credentials

## Your Application Features

✅ **User Registration & Login**
- First name, last name, email, password
- Secure password hashing
- Session management

✅ **Dashboard**
- View total balance
- Monthly income/expenses summary
- Net monthly calculation

✅ **Quick Deposit**
- Easy money deposit feature
- Automatically updates balance

✅ **Transaction Management**
- Add income/expense transactions
- Multiple categories (salary, food, utilities, etc.)
- View transaction history
- Delete transactions

✅ **Monthly Summary**
- View financial data by month
- Track spending patterns

✅ **Responsive Design**
- Works on desktop and mobile

## File Structure Created

```
financial_dashboard/
├── index.html              # Main application
├── styles.css              # All styling
├── script.js               # Frontend JavaScript
├── SETUP_GUIDE.md          # This file
├── config/
│   └── database.php        # Database connection
├── api/
│   ├── auth.php            # Login/Register API
│   └── transactions.php    # Transaction API
└── database/
    └── setup.sql           # Database schema
```

## Database Tables Created

- **users**: Stores user accounts (firstname, lastname, email, password)
- **transactions**: Stores all financial transactions
- **accounts**: Tracks user account balances

## What You Can Do Now

1. **Start XAMPP** and open `http://localhost/financial_dashboard`
2. **Register** a new account
3. **Login** and start using the dashboard
4. **Make a deposit** to add money to your account
5. **Add transactions** to track your finances
6. **View monthly summaries** of your financial data

## Need Help?

If you encounter any issues:
1. Make sure Apache and MySQL are running in XAMPP
2. Check that the database was created successfully
3. Verify files are in the correct htdocs directory
4. Check browser console for any JavaScript errors

Your financial dashboard is now ready to use! 🎉
