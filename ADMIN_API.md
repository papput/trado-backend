🧭 Admin API Documentation

Base URL:

/api/admin


All routes are protected — require a valid Bearer Token (Authorization: Bearer <token>)
Middleware: verifyAdmin

📊 Dashboard
GET /dashboard

Get overall statistics for the admin dashboard.

Response

{
  "totalUsers": 120,
  "totalBalance": 50000,
  "pendingDeposits": 10,
  "pendingWithdrawals": 5,
  "pendingExchanges": 2,
  "blockedUsers": 3,
  "totalPending": 17
}

GET /activity

Get the latest 50 transaction activities.

Response

[
  {
    "_id": "6731f2a...",
    "type": "deposit",
    "userId": { "username": "john", "email": "john@example.com" },
    "amount": 100,
    "status": "completed",
    "approvedBy": { "username": "admin" },
    "createdAt": "2025-11-06T11:30:00Z"
  }
]

👥 User Management
GET /users

Get all users (supports search & pagination).

Query Params

Name	Type	Default	Description
search	string	null	Filter by username or email
page	number	1	Page number
limit	number	10	Number of records per page

Response

{
  "data": [
    { "username": "john", "email": "john@example.com", "balance": 100 }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1 }
}

GET /users/:id

Get details of a single user.

Response

{
  "_id": "672c09f6d2a1",
  "username": "john",
  "email": "john@example.com",
  "balance": 200
}

PATCH /users/:id/balance

Update user’s balance (add, subtract, or set manually).

Body

{ "amount": 50, "action": "add" }


Response

{ "message": "User balance updated successfully", "balance": 250 }

PATCH /users/:id/limit

Update user’s balance limit.

Body

{ "limit": 1000 }


Response

{ "message": "Balance limit updated successfully", "balanceLimit": 1000 }

PATCH /users/:id/block

Block a user with an optional reason.

Body

{ "reason": "Fraudulent activity" }


Response

{
  "message": "User blocked successfully",
  "user": {
    "_id": "672c09f6d2a1",
    "isBlocked": true,
    "blockReason": "Fraudulent activity"
  }
}

PATCH /users/:id/unblock

Unblock a user.

Response

{ "message": "User unblocked successfully" }

💰 Deposit Management
GET /deposits/pending

Get all pending deposits.

Response

[
  {
    "_id": "6731e8d...",
    "userId": { "username": "john", "email": "john@example.com" },
    "amount": 150,
    "status": "pending"
  }
]

POST /deposits/:id/approve

Approve a pending deposit and credit user balance.

Body

{ "depositAmount": 100 }


Response

{ "message": "Deposit approved and balance updated" }

POST /deposits/:id/reject

Reject a deposit with reason.

Body

{ "reason": "Invalid transaction hash" }


Response

{ "message": "Deposit rejected" }

GET /deposits/addresses

Get stored deposit addresses.

Response

{
  "tron": { "address": "TXYZ...", "qrCode": "..." },
  "ethereum": { "address": "0xABC...", "qrCode": "..." }
}

POST /deposits/addresses

Update deposit address for a network.

Body

{
  "network": "tron",
  "address": "TXYZ123...",
  "qrCode": "https://example.com/qrcode"
}


Response

{ "message": "Deposit address updated" }

💸 Withdrawal Management
GET /withdrawals/pending

Get pending withdrawal requests.

Response

[
  {
    "_id": "6731f300...",
    "type": "withdrawal",
    "status": "pending",
    "userId": { "username": "john", "email": "john@example.com" },
    "amount": 100
  }
]

POST /withdrawals/:id/approve

Approve a withdrawal and deduct balance.

Response

{ "message": "Withdrawal approved successfully" }

POST /withdrawals/:id/reject

Reject a withdrawal with a reason.

Body

{ "reason": "Bank details invalid" }


Response

{ "message": "Withdrawal rejected successfully" }

🔁 Exchange Management
GET /exchanges/pending

Get pending exchange transactions.

Response

[
  {
    "_id": "6731e9d...",
    "userId": { "username": "john", "email": "john@example.com" },
    "amount": 100,
    "status": "pending"
  }
]

POST /exchanges/:id/approve

Approve an exchange and update balance.

Body

{ "receivedAmount": 82 }


Response

{ "message": "Exchange approved successfully" }

POST /exchanges/:id/reject

Reject an exchange with reason.

Body

{ "reason": "Rate mismatch" }


Response

{ "message": "Exchange rejected successfully" }

GET /exchanges/rate

Get current exchange rates.

Response

{ "USDT_USD": 1, "USDT_INR": 83 }

POST /exchanges/rate

Update exchange rate configuration.

Body

{ "rates": { "USDT_INR": 83.5 } }


Response

{ "message": "Exchange rates updated successfully" }

🧩 Summary Table
Category	Method	Endpoint	Description
Dashboard	GET	/dashboard	Get overall admin stats
	GET	/activity	Get recent transactions
Users	GET	/users	Get all users
	GET	/users/:id	Get single user
	PATCH	/users/:id/balance	Update user balance
	PATCH	/users/:id/limit	Update balance limit
	PATCH	/users/:id/block	Block a user
	PATCH	/users/:id/unblock	Unblock a user
Deposits	GET	/deposits/pending	View pending deposits
	POST	/deposits/:id/approve	Approve a deposit
	POST	/deposits/:id/reject	Reject a deposit
	GET	/deposits/addresses	Get deposit addresses
	POST	/deposits/addresses	Set deposit addresses
Withdrawals	GET	/withdrawals/pending	View pending withdrawals
	POST	/withdrawals/:id/approve	Approve withdrawal
	POST	/withdrawals/:id/reject	Reject withdrawal
Exchanges	GET	/exchanges/pending	View pending exchanges
	POST	/exchanges/:id/approve	Approve exchange
	POST	/exchanges/:id/reject	Reject exchange
	GET	/exchanges/rate	Get exchange rate
	POST	/exchanges/rate	Set exchange rate