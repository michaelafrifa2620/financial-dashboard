# Financial Dashboard

A simple web-based financial dashboard built with Flask and SQLite for tracking personal income and expenses.

## Features

- **User Authentication**: Register and login functionality
- **Transaction Management**: Add, view, and categorize income and expenses
- **Financial Overview**: Visual charts and summary statistics
- **Responsive Design**: Works on desktop and mobile devices
- **Database Storage**: SQLite database for persistent data storage

## Demo Account

Try the application with the demo account:
- **Username**: demo
- **Password**: demo123

## Installation

1. Install Python 3.7+ if not already installed
2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Navigate to the project directory
2. Run the Flask application:
   ```bash
   python app.py
   ```
3. Open your web browser and go to `http://localhost:5000`

## Usage

### Registration
1. Click "Register" on the home page
2. Fill in username, email, and password
3. Click "Register" to create your account

### Login
1. Click "Login" on the home page
2. Enter your username and password
3. Click "Login" to access your dashboard

### Dashboard Features
- **Summary Cards**: View total income, expenses, and net balance
- **Add Transactions**: Use the form to add new income or expense entries
- **Monthly Chart**: Visual representation of monthly income vs expenses
- **Recent Transactions**: Table showing your latest 20 transactions

### Transaction Categories

**Income Categories:**
- Salary
- Freelance
- Investment
- Other Income

**Expense Categories:**
- Housing
- Food
- Transportation
- Bills
- Entertainment
- Healthcare
- Other Expense

## Database

The application uses SQLite database (`financial_dashboard.db`) which is automatically created when you first run the application. The database includes:

- **Users table**: Stores user account information
- **Transactions table**: Stores all financial transactions

## File Structure

```
financial_dashboard/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── financial_dashboard.db # SQLite database (created automatically)
├── templates/            # HTML templates
│   ├── base.html         # Base template
│   ├── index.html        # Home page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   └── dashboard.html    # Main dashboard
└── static/               # Static files (currently empty)
```

## Security Notes

- Passwords are hashed using SHA-256
- Session management for user authentication
- Input validation on forms
- SQL injection protection with parameterized queries

## Future Enhancements

- Export data to CSV/PDF
- Budget planning and tracking
- Multiple account support
- Category-wise expense analysis
- Email notifications for spending limits
- Data visualization improvements
- API endpoints for mobile app integration

## Troubleshooting

1. **Port already in use**: Change the port in `app.py` from 5000 to another port
2. **Database errors**: Delete `financial_dashboard.db` and restart the application
3. **Template errors**: Ensure all template files are in the `templates/` directory
4. **Missing dependencies**: Run `pip install -r requirements.txt` again

## Contributing

Feel free to fork this project and submit pull requests for improvements or bug fixes.
