// PIN verification endpoint
app.post('/api/verify-pin', (req, res) => {
  const { email, pin } = req.body;
  if (!email || !pin) return res.status(400).json({ error: 'Email and PIN required' });
  db.query('SELECT * FROM users WHERE email = ? AND verify_pin = ?', [email, pin], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid PIN or email' });
    db.query('UPDATE users SET is_verified = TRUE, verify_pin = NULL WHERE email = ?', [email], err2 => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
  });
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection config (edit as needed)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // set your MySQL root password
  database: 'palmpay'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});


// Create users table if not exists (with email and verification PIN fields)
const userTableSql = `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verify_pin VARCHAR(10)
)`;
db.query(userTableSql, err => {
  if (err) console.error('Error creating users table:', err);
});

const nodemailer = require('nodemailer');

// Configure your email transport (replace with your SMTP details)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: 'your_email@gmail.com', // replace with your email
    pass: 'your_email_password'   // replace with your email password or app password
  }
});

// Helper to generate a 6-digit PIN
function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const verifyPin = generatePin();
  db.query('INSERT INTO users (username, email, password, verify_pin) VALUES (?, ?, ?, ?)', [username, email, password, verifyPin], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username or email already exists' });
      return res.status(500).json({ error: 'Database error' });
    }
    // Send verification PIN email
    const mailOptions = {
      from: 'your_email@gmail.com',
      to: email,
      subject: 'Your Verification PIN',
      html: `<p>Hi ${username},</p><p>Your verification PIN is: <b>${verifyPin}</b></p><p>Enter this PIN to verify your email address.</p>`
    };
    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('Error sending email:', mailErr);
        return res.status(500).json({ error: 'Failed to send verification email' });
      }
      res.json({ success: true });
    });
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, user: { username } });
  });
});

const PORT = process.env.PORT || 3001;

// Test endpoint to get all users
app.get('/api/users', (req, res) => {
  db.query('SELECT id, username FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ users: results });
  });
});

app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
});
