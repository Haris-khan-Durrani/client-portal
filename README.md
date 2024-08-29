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
