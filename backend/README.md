# PalmPay Backend (Node.js + Express + MySQL)

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a MySQL database named `palmpay` (or change the name in `index.js`).
3. Edit MySQL credentials in `index.js` if needed.
4. Start the backend:
   ```
   npm start
   ```

## API Endpoints

- `POST /api/register` — Register a new user
  - Body: `{ "username": "user", "password": "pass" }`
- `POST /api/login` — Login
  - Body: `{ "username": "user", "password": "pass" }`

## Notes
- Passwords are stored as plain text for demo purposes. Use hashing (bcrypt) for production.
- CORS is enabled for all origins.
