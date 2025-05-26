# Student Portal Backend - Express + PostgreSQL

## Features and Technology Stack

- **Authentication**: Robust JWT-based authentication for secure user access.
- **Student Services**: Manage profiles, attendance data, and fee details efficiently.
- **Payment Integration**: Seamless Razorpay integration for secure payment processing.
- **Error Handling**: Descriptive error responses for better debugging and usability.
- **High-Performance**: Optimized for speed with connection pooling and response compression.
- **Tech Stack**:
  - **Server Framework**: Express.js
  - **Database ORM**: Sequelize with PostgreSQL
  - **Payment Gateway**: Razorpay

## Available Routes

| **Category**            | **Method** | **Endpoint**                  | **Description**                                      |
| ----------------------- | ---------- | ----------------------------- | ---------------------------------------------------- |
| **Authentication**      | POST       | `/auth/login`                      | Authenticate user and issue JWT token                |
|                         | POST       | `/auth/logout`                     | Logout user and invalidate token                     |
|                         | POST        | `/auth/validate-token`             | Validate JWT token                                   |                 |
|                         | GET        | `/student/profile`            | Retrieve student profile details                     |
|                         | GET        | `/student/attendance-data`            | Fetch attendance records                             |
|                         | GET        | `/student/internal-marks`             | Fetch internal marks                                 |
| **Fee Management**      | GET        | `/student/fee-details`                | View unpaid fee details                              |
|                         | POST       | `/payment/create-order`       | Generate Razorpay order for payment                  |
|                         | POST       | `/payment/verify-payment`     | Verify and process payments                          |
| **Transaction Logs**    | GET        | `/payment/transaction-log-data` | Retrieve transaction history (paginated)             |
| **Utility**             | GET        | `/db-activity-check`          | Checks database activity and returns total user count. |
