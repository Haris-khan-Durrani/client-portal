![Project](https://api.hariskhandurrani.com/portal1.jpg)
# Express.js Application with MySQL, Sessions, and OTP Authentication

This project is an advanced Express.js application that integrates MySQL, session management, OTP-based authentication, file handling, and dynamic page rendering. The application is built to handle domain-specific configurations and communicate with external services via Socket.IO.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Middleware](#middleware)
  - [Routes](#routes)
  - [Encryption/Decryption](#encryptiondecryption)
  - [OTP Email Sending](#otp-email-sending)
  - [Database Schema](#database-schema)
  - [Socket.IO Integration](#socketio-integration)
- [Environment Variables](#environment-variables)
- [CORS Configuration](#cors-configuration)
- [Running the Application](#running-the-application)
- [License](#license)

## Features

- **Session Management**: Securely manages user sessions using `express-session` with MySQL as the session store.
- **Domain-Based Configuration**: Middleware to fetch, cache, and utilize configurations based on the domain.
- **OTP Authentication**: Secure OTP generation, email sending, and verification for login authentication.
- **File Handling**: Supports secure file uploads with encryption for sensitive data.
- **Dynamic Page Rendering**: Renders pages dynamically based on domain-specific settings stored in the database.
- **Socket.IO Integration**: Connects to a Socket.IO server for real-time data fetching and interaction.
- **Email Notifications**: Sends OTPs and other notifications via a configured email service (e.g., Gmail SMTP).
- **CORS Support**: Allows cross-origin requests with configurable CORS settings.

## Installation

To set up the application locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```

## Usage

### Middleware

- **`domainCheck` Middleware**: 
  - **Purpose**: Fetches domain-specific configurations from the database and stores them in the session.
  - **How it Works**:
    - It checks the `x-forwarded-host` header in the request to determine the domain.
    - If the configuration for the domain is already stored in the session, it uses that; otherwise, it fetches the configuration from the `domain_config` table in the database.
    - If no configuration is found for the domain, a 404 error is returned.
    - Example:
      ```javascript
      const domainCheck = async (req, res, next) => {
          const domain = req.headers['x-forwarded-host'];
          if (req.session && req.session.config && req.session.config.domain === domain) {
              req.config = req.session.config;
              return next();
          }

          try {
              const [rows] = await pool.query('SELECT * FROM domain_config WHERE domain = ?', [domain]);
              if (rows.length > 0) {
                  req.config = rows[0];
                  req.session.config = req.config;
                  next();
              } else {
                  res.status(404).send('Configuration not found for this domain.');
              }
          } catch (error) {
              res.status(500).send('Internal Server Error: Unable to fetch configuration.');
          }
      };
      ```

### Routes

- **`/` (GET)**:
  - **Description**: Renders the login page. If the user is already authenticated, redirects to the dashboard.
  - **Example Usage**:
    ```javascript
    app.get('/', (req, res) => {
        if (req.session.user) {
            res.redirect('/dashboard');
        } else {
            res.render('login', { logo: req.config.logo_url });
        }
    });
    ```

- **`/login` (POST)**:
  - **Description**: Handles user login by generating and sending an OTP to the user's email.
  - **Process**:
    - Receives the username (email).
    - Generates a 6-digit OTP and stores it in a map for verification.
    - Sends the OTP via email and a webhook.
    - Redirects the user to an OTP entry page.
  - **Example Usage**:
    ```javascript
    app.post('/login', async (req, res) => {
        const { username } = req.body;
        const otp = generateOTP();
        otpMap.set(username, otp);

        const emailStatus = await sendOTPEmailAndTriggerWebhook(username, otp);
        if (emailStatus) {
            res.render('otp', { username });
        } else {
            res.send('Error occurred while sending OTP.');
        }
    });
    ```

- **`/verifyOTP` (POST)**:
  - **Description**: Verifies the OTP entered by the user. If the OTP is correct, the user is redirected to the dashboard.
  - **Process**:
    - Receives the OTP and username.
    - Verifies if the OTP matches the one stored in the map.
    - If valid, the session is updated, and the user is redirected to the dashboard.
  - **Example Usage**:
    ```javascript
    app.post('/verifyOTP', (req, res) => {
        const { username, otp } = req.body;
        if (otpMap.has(username) && otpMap.get(username) === otp) {
            req.session.user = username;
            otpMap.delete(username);
            res.redirect('/dashboard');
        } else {
            res.redirect('/?error=Invalid OTP');
        }
    });
    ```

- **`/dashboard` (GET)**:
  - **Description**: Displays the user dashboard with domain-specific configurations.
  - **Process**:
    - The user's session is checked to ensure they are logged in.
    - Real-time data is fetched using Socket.IO and rendered on the dashboard.
  - **Example Usage**:
    ```javascript
    app.get('/dashboard', sessionCheck, async (req, res) => {
        socket.emit('contact', {
            query1: req.session.user,
            query2: req.config.location_id,
            query3: 10,
        });

        socket.once('searchResult', async (data) => {
            if (data.error) {
                res.status(500).send('An error occurred.');
            } else {
                const htmlContent = generateHtmlContent(data.contacts);
                res.render('dashboard', {
                    title: 'Dashboard',
                    user: req.session.user,
                    logo: req.config.logo_url,
                    contacts: htmlContent,
                });
            }
        });
    });
    ```

- **`/company` (GET)**:
  - **Description**: Displays detailed information about a specific company, including downloadable files and other details.
  - **Process**:
    - The company ID is passed as a query parameter.
    - The company details are fetched using Socket.IO.
    - The data is then rendered dynamically on the page.
  - **Example Usage**:
    ```javascript
    app.get('/company', sessionCheck, async (req, res) => {
        const companyId = req.query.id;
        socket.emit('contactid', {
            query1: companyId,
            query2: req.config.location_id,
        });

        socket.once('searchResult', async (data) => {
            const htmlContent = generateCompanyHtml(data.contact);
            res.render('company', {
                title: `${data.contact.companyName} | Company`,
                user: req.session.user,
                contacts: htmlContent,
            });
        });
    });
    ```

- **`/single` (GET)**:
  - **Description**: Displays visa-related information for a specific company.
  - **Process**:
    - The visa data is fetched based on the company ID using Socket.IO.
    - The visa information is rendered dynamically.
  - **Example Usage**:
    ```javascript
    app.get('/single', sessionCheck, async (req, res) => {
        const companyId = req.query.id;
        socket.emit('contactid', {
            query1: companyId,
            query2: req.config.v_location_id,
        });

        socket.once('searchResult', async (data) => {
            const htmlContent = generateVisaHtml(data.contact);
            res.render('single', {
                title: `${data.contact.companyName} | Visa`,
                user: req.session.user,
                contacts: htmlContent,
            });
        });
    });
    ```

- **`/add-page` (GET/POST)**:
  - **Description**: Admin interface to add new pages. Pages are tied to specific domains and can be managed through this route.
  - **GET**: Displays a form to add a new page.
  - **POST**: Handles form submission and adds a new page to the database.
  - **Example Usage**:
    ```javascript
    app.get('/add-page', sessionCheck, async (req, res) => {
        const allPages = await fetchAllPages();
        res.render('add-page', {
            user: req.session.user,
            pages: allPages,
        });
    });

    app.post('/add-page', express.json(), sessionCheck, (req, res) => {
        const { domain, icon, title, featureImageUrl, landingPageUrl } = req.body;
        const sql = 'INSERT INTO pages (domain, icon, title, feature_image_url, landing_page_url) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [domain, icon, title, featureImageUrl, landingPageUrl], (err, result) => {
            if (err) {
                return res.status(500).send('Error adding new page');
            }
            res.redirect('/add-page');
        });
    });
    ```

- **`/edit-addonpage/:id` (GET/POST)**:
  - **Description**: Edit an existing page by its ID. The form is pre-filled with the current page data.
  - **GET**: Fetches the existing page data and displays it in a form for editing.
  - **POST**: Handles form submission and updates the page in the database.
  - **Example Usage**:
    ```javascript
    app.get('/edit-addonpage/:id', sessionCheck, async (req, res) => {
        const pageId = req.params.id;
        const pageData = await fetchPageById(pageId);
        res.render('edit-page', {
            user: req.session.user,
            page: pageData,
        });
    });

    app.post('/edit-addonpage/:id', express.json(), sessionCheck, (req, res) => {
        const { id, domain, icon, title, featureImageUrl, landingPageUrl } = req.body;
        const sql = 'UPDATE pages SET domain = ?, icon = ?, title = ?, feature_image_url = ?, landing_page_url = ? WHERE id = ?';
        db.query(sql, [domain, icon, title, featureImageUrl, landingPageUrl, id], (err, result) => {
            if (err) {
                return res.status(500).send('Error updating page');
            }
            res.redirect('/add-page');
        });
    });
    ```

- **`/addon/:page` (GET)**:
  - **Description**: Renders addon pages dynamically based on the domain and user session.
  - **Process**:
    - The page URL is decrypted and rendered with additional parameters for the user.
  - **Example Usage**:
    ```javascript
    app.get('/addon/:page', sessionCheck, async (req, res) => {
        const addonPageUrl = decrypt(req.params.page, "667766");
        const userParams = {
            full_name: req.session.namo,
            email: req.session.user,
        };
        const updatedUrl = `${addonPageUrl}?${new URLSearchParams(userParams).toString()}`;
        res.render('addon', {
            user: req.session.user,
            addonPageUrl: updatedUrl,
        });
    });
    ```

