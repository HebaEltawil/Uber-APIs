# Uber-like Core API Service

A production-ready **Node.js**, **Express**, and **MongoDB (Mongoose)** backend architecture. It provides a secure, fully featured REST API managing user authentication, secure credential handling, and a strict state-driven ride-sharing workflow.

## 🚀 Key Features

### 🔐 Authentication & Security
- **Data Hashing:** Secure password hashing prior to persistence using **Bcrypt** (10 salt rounds).
- **Stateless Authorization:** Secure session issuance via **JSON Web Tokens (JWT)** with a 7-day expiration window.
- **Strict Validation:** Dual-layered client input sanitary checks via conditional code flows and declarative `express-validator` rules.
- **Automated Profile Provisioning:** Dynamically provisions an accompanying `Driver` profile if a registrant carries a driver role flag.

### 🚗 Ride Lifecycle Architecture
- **State Engine Management:** Strict transition routing for ride requests: `requested` ➔ `accepted` ➔ `started` ➔ `completed` / `cancelled`.
- **Driver Dispatch Management:** Automates driver availability toggling (`isAvailable`), preventing a driver from accepting multiple parallel assignments.
- **Access Guard Middleware:** Enforces data privacy so that only authorized passengers or assigned drivers can interact with or view individual ride assets.

---

## 🛠️ Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database Engine:** MongoDB via Mongoose ODM
- **Cryptography & Tokens:** Bcrypt, JSON Web Tokens (JWT)
- **Request Validation:** Express-Validator

---

## 📦 Installation & Setup

1. **Clone the repository and install the dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in your root directory and define the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_secure_jwt_secret_key
   ```

3. **Launch the Server:**
   ```bash
   npm run dev
   ```

---

## 🛣️ API Endpoints Reference

### 1. Authentication Routes (`/api/auth`)
*No authorization token required.*

| Endpoint | Method | Description | Request Body Payload |
| :--- | :---: | :--- | :--- |
| `/register` | `POST` | Registers a new User or Driver account | `{ "name": "...", "email": "...", "password": "...", "confirm_password": "...", "role": "driver" }` |
| `/login` | `POST` | Validates credentials and returns a JWT token | `{ "email": "...", "password": "..." }` |

### 2. Ride Management Routes (`/api/rides`)
*All endpoints below strictly require an authorization header:* `Authorization: Bearer <JWT_TOKEN>`

| Endpoint | Method | Description | Parameters / Payload |
| :--- | :---: | :--- | :--- |
| `/` | `POST` | Places a new ride request | `{ "pickupLocation": "...", "dropoffLocation": "..." }` |
| `/` | `GET` | Fetches historical and ongoing rides for the active user | *None* |
| `/:id` | `GET` | Retrieves detailed metrics of a specific ride | `id` (Ride ID as URL Parameter) |
| `/:id/accept` | `PUT` | Allows an available driver to claim an unassigned ride | `id` (Ride ID as URL Parameter) |
| `/:id/start` | `PUT` | Flags an accepted ride as actively en route | `id` (Ride ID as URL Parameter) |
| `/:id/complete`| `PUT` | Concludes the trip, updates final fare, sets driver to available | `id` (URL Param) + optional Body: `{ "fare": 45.50 }` |
| `/:id/cancel` | `PUT` | Cancels an unstarted ride (accessible by either party) | `id` (Ride ID as URL Parameter) |

---

## ⚠️ Error Handling Contract

The application handles operational anomalies globally. If an exception triggers, the API returns a structured JSON layout:

```json
{
  "message": "Error description clarifying the failure constraint."
}
```

### Standard Status Violations:
- `400 Bad Request`: Fired when validation steps fail, inputs mismatch, or unlawful logical transitions are attempted (e.g., accepting an already filled ride).
- `403 Forbidden`: Fired when an authenticated actor attempts to read or mutate a ride lifecycle they do not own or participate in.
- `404 Not Found`: Fired when requested resource documents (Ride/Driver) do not exist.
- `500 Internal Server Error`: Catch-all fallback response ensuring system stability.
