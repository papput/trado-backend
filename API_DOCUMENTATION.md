# Crypto Trading Platform API Documentation

## Base URL
\`\`\`
http://localhost:5000/api
\`\`\`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## Auth Endpoints

### 1. Send OTP
**POST** `/auth/send-otp`

Request:
\`\`\`json
{
  "phone": "8579304",
  "countryCode": "+91"
}
\`\`\`

Response:
\`\`\`json
{
  "message": "OTP sent successfully",
  "phone": "8579304"
}
\`\`\`

---

### 2. Verify OTP & Signup
**POST** `/auth/verify-otp-signup`

Request:
\`\`\`json
{
  "phone": "8579304",
  "otp": "123456",
  "inviteCode": "EB56wzdR34zP"
}
\`\`\`

Response:
\`\`\`json
{
  "message": "Signup successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "phone": "8579304",
    "balance": 0
  }
}
\`\`\`

---

### 3. Login
**POST** `/auth/login`

Request:
\`\`\`json
{
  "phone": "8579304"
}
\`\`\`

Response:
\`\`\`json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "phone": "8579304",
    "balance": 0
  }
}
\`\`\`

---

## Wallet Endpoints

### 1. Get Balance
**GET** `/wallet/balance`


Response:
\`\`\`json
{
  "balance": 100.5,
  "currency": "USDT"
}
\`\`\`

---

### 2. Add Wallet Address
**POST** `/wallet/address`

Request:
\`\`\`json
{
  "network": "tron",
  "address": "TQCz8aSwFE5Yt5wWYj7xQnriqvKSxKkeAh"
}
\`\`\`

Response:
\`\`\`json
{
  "message": "Wallet address added successfully",
  "walletAddress": {
    "_id": "wallet_id",
    "userId": "user_id",
    "network": "tron",
    "address": "TQCz8aSwFE5Yt5wWYj7xQnriqvKSxKkeAh",
    "isDefault": true
  }
}
\`\`\`

---

### 3. Get All Wallet Addresses
**GET** `/wallet/addresses`

Response:
\`\`\`json
{
  "walletAddresses": [
    {
      "_id": "wallet_id",
      "userId": "user_id",
      "network": "tron",
      "address": "TQCz8aSwFE5Yt5wWYj7xQnriqvKSxKkeAh",
      "isDefault": true
    }
  ]
}
\`\`\`

---

### 4. Get Wallet Address by Network
**GET** `/wallet/address/:network`

Response:
\`\`\`json
{
  "walletAddress": {
    "_id": "wallet_id",
    "userId": "user_id",
    "network": "tron",
    "address": "TQCz8aSwFE5Yt5wWYj7xQnriqvKSxKkeAh",
    "isDefault": true
  }
}
\`\`\`

---

## Transaction Endpoints

### 1. Deposit USDT
**POST** `/transactions/deposit`

Request:
\`\`\`json
{
  "network": "tron",
  "amount": 100
}
\`\`\`

Response:
\`\`\`json
{
  "message": "Deposit initiated",
  "transaction": {
    "_id": "transaction_id",
    "userId": "user_id",
    "type": "deposit",
    "cryptoAmount": 100,
    "fiatAmount": 10000,
    "network": "tron",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

---

### 2. Withdraw USDT
**POST** `/transactions/withdraw`

Request:
\`\`\`json
{
  "network": "tron",
  "amount": 50,
  "walletAddress": "TQCz8aSwFE5Yt5wWYj7xQnriqvKSxKkeAh"
}
\`\`\`

Response:
\`\`\`json
{
  "message": "Withdrawal initiated",
  "transaction": {
    "_id": "transaction_id",
    "userId": "user_id",
    "type": "withdraw",
    "cryptoAmount": 50,
    "fiatAmount": 5000,
    "network": "tron",
    "walletAddress": "TQCz8aSwFE5Yt5wWYj7xQnriqvKSxKkeAh",
    "status": "pending"
  },
  "newBalance": 50
}
\`\`\`

---

### 3. Exchange USDT to INR
**POST** `/transactions/exchange`

Request:
\`\`\`json
{
  "cryptoAmount": 25
}
\`\`\`

Response:
\`\`\`json
{
  "message": "Exchange successful",
  "transaction": {
    "_id": "transaction_id",
    "userId": "user_id",
    "type": "exchange",
    "cryptoAmount": 25,
    "fiatAmount": 2500,
    "status": "completed"
  },
  "newBalance": 75
}
\`\`\`

---

### 4. Get Deposit History
**GET** `/transactions/deposit-history?page=1&limit=10`

Response:
\`\`\`json
{
  "transactions": [
    {
      "_id": "transaction_id",
      "userId": "user_id",
      "type": "deposit",
      "cryptoAmount": 100,
      "fiatAmount": 10000,
      "network": "tron",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
\`\`\`

---

### 5. Get Withdraw History
**GET** `/transactions/withdraw-history?page=1&limit=10`

Response:
\`\`\`json
{
  "transactions": [
    {
      "_id": "transaction_id",
      "userId": "user_id",
      "type": "withdraw",
      "cryptoAmount": 50,
      "fiatAmount": 5000,
      "network": "tron",
      "walletAddress": "TQCz8aSwFE5Yt5wWYj7xQnriqvKSxKkeAh",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
\`\`\`

---

### 6. Get Exchange History
**GET** `/transactions/exchange-history?page=1&limit=10`

Response:
\`\`\`json
{
  "transactions": [
    {
      "_id": "transaction_id",
      "userId": "user_id",
      "type": "exchange",
      "cryptoAmount": 25,
      "fiatAmount": 2500,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
\`\`\`

---

## Referral Endpoints

### 1. Get Referral Code
**GET** `/referral/code`

Response:
\`\`\`json
{
  "referralCode": "EB56wzdR34zP",
  "inviteLink": "https://tra-do.com/invite?code=EB56wzdR34zP"
}
\`\`\`

---

### 2. Get Referral Statistics
**GET** `/referral/stats`

Response:
\`\`\`json
{
  "totalReferrals": 5,
  "totalBonus": 50.5,
  "referralsByLevel": {
    "level1": 3,
    "level2": 1,
    "level3": 1,
    "level4": 0,
    "level5": 0
  }
}
\`\`\`

---

### 3. Get Referral History
**GET** `/referral/history?page=1&limit=10`

Response:
\`\`\`json
{
  "referrals": [
    {
      "_id": "referral_id",
      "referrerId": "user_id",
      "referredUserId": "referred_user_id",
      "level": 1,
      "bonusPercentage": 0.1,
      "bonusAmount": 10.5,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
\`\`\`

---

## Password Endpoints

### 1. Send Password Reset OTP
**POST** `/password/send-reset-otp`

Response:
\`\`\`json
{
  "message": "OTP sent successfully",
  "phone": "8579304"
}
\`\`\`

---

### 2. Reset Transaction Password
**POST** `/password/reset`

Request:
\`\`\`json
{
  "otp": "123456",
  "newPassword": "1234"
}
\`\`\`

Response:
\`\`\`json
{
  "message": "Transaction password reset successfully"
}
\`\`\`

---

## Error Responses

All error responses follow this format:

\`\`\`json
{
  "error": "Error message describing what went wrong"
}
\`\`\`

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## Setup Instructions

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create `.env` file from `.env.example`:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Update `.env` with your configuration

4. Run development server:
\`\`\`bash
npm run dev
\`\`\`

5. Build for production:
\`\`\`bash
npm run build
npm start
\`\`\`

---
