Express.js Application with MySQL, Sessions, and OTP Authentication
This is an Express.js application integrated with MySQL, session management, OTP authentication, and several other features. The application is designed to handle domain-based configurations, serve pages dynamically, and communicate with external services via Socket.IO.

Features
Session Management: Uses express-session with MySQL as the session store.
Domain-Based Configuration: Middleware to fetch and store configuration based on the domain.
OTP Authentication: Generate and send OTP via email and trigger a webhook.
File Handling: Supports file uploads and encrypted storage.
Dynamic Page Rendering: Serve different pages based on domain configurations.
Socket.IO Integration: Connects to a Socket.IO server for real-time data fetching.
Email Notifications: Sends OTP and other notifications via configured email service.
CORS Support: Allows cross-origin requests.
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/your-repo-name.git
cd your-repo-name
Install dependencies:

bash
Copy code
npm install
Environment Variables: Create a .env file in the root directory with the following content:

makefile
Copy code
PORT=1001
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
Run the application:

bash
Copy code
npm start
Usage
Middleware
domainCheck: Fetches configuration based on the domain from the domain_config table.
Session Configuration: Uses express-mysql-session to store sessions in the MySQL database.
Routes
/: Renders the login page.
/login: Handles login requests, generates OTP, and sends it via email.
/verifyOTP: Verifies the OTP entered by the user.
/dashboard: Main dashboard page after successful login.
/company: Displays company-specific data.
/single: Displays specific visa data for a company.
/add-page: Admin interface to add a new page.
/edit-addonpage/:id: Edit an existing page.
Encryption/Decryption
Encrypt: The encrypt function is used to securely encrypt text data using crypto.
Decrypt: The decrypt function is used to decrypt the encrypted text back to its original form.
OTP Email Sending
Nodemailer Configuration: The application is configured to send emails using Gmail SMTP.
OTP Generation: Generates a 6-digit OTP and sends it to the user's email.
Database Schema
The application uses MySQL for storing session data, user information, and domain-specific configurations.

Tables:
domain_config: Stores domain-specific configurations.
pages: Stores information about dynamically served pages.
Socket.IO Integration
The application connects to a Socket.IO server to fetch data in real-time. Example usage includes retrieving company data and visa information.

License
This project is licensed under the MIT License.
