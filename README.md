# Student Portal Backend - Express + PostgreSQL

## Features and Technology Stack

- **Authentication**: Robust JWT-based authentication for secure user access.
- **Student Services**: Manage profiles, attendance data, and fee details efficiently.
- **Payment Integration**: Seamless Razorpay integration for secure payment processing.
- **Error Handling**: Descriptive error responses for better debugging and usability.
- **Tech Stack**:
  - **Server Framework**: Express.js
  - **Database ORM**: Sequelize
  - **Payment Gateway**: Razorpay

## Available Routes

| **Category**            | **Method** | **Endpoint**            | **Description**                       |
| ----------------------- | ---------- | ----------------------- | ------------------------------------- |
| **Authentication**      | POST       | `/login`                | Authenticate user and issue JWT token |
|                         | POST       | `/logout`               | Logout user and invalidate token      |
|                         | GET        | `/validate-token`       | Validate JWT token                    |
| **Student Information** | GET        | `/student-profile`      | Retrieve student profile details      |
|                         | GET        | `/attendance-data`      | Fetch attendance records              |
|                         | GET        | `/internal-marks`       | Fetch internal marks                  |
| **Fee Management**      | GET        | `/fee-details`          | View unpaid fee details               |
|                         | POST       | `/create-order`         | Generate Razorpay order for payment   |
|                         | POST       | `/verify-payment`       | Verify and process payments           |
| **Transaction Logs**    | GET        | `/transaction-log-data` | Retrieve transaction history          |
