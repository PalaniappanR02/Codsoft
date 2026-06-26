const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email, otp) {
  if (!process.env.SMTP_HOST) {
    console.log(`\n📧  OTP for ${email}:  ${otp}\n`);
    return;
  }
  try {
    const nodemailer = require('nodemailer');
    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await t.sendMail({
      from: process.env.SMTP_FROM || 'noreply@shopeasy.com', to: email,
      subject: 'Your verification code',
      text: `Your code is: ${otp}. Expires in 15 minutes.`,
    });
  } catch (err) {
    console.error('Email error:', err.message);
    console.log(`📧  OTP for ${email}:  ${otp}`);
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const existing = db.get('users').find({ email: email.toLowerCase() }).value();
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const id = uuidv4();
    db.get('users').push({
      id, email: email.toLowerCase(), password: hash, role: 'customer',
      full_name: '', phone: '', address: '',
      otp_code: otp, otp_expires: Date.now() + 15 * 60 * 1000,
      verified: false, reset_token: null, reset_expires: null,
      created_date: new Date().toISOString(),
    }).write();
    await sendOtpEmail(email, otp);
    res.json({ message: 'Registered. Check terminal/email for OTP.' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Registration failed' }); }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { email, otpCode } = req.body;
  const user = db.get('users').find({ email: email?.toLowerCase() }).value();
  if (!user) return res.status(400).json({ message: 'User not found' });
  if (user.otp_code !== otpCode) return res.status(400).json({ message: 'Invalid code' });
  if (Date.now() > user.otp_expires) return res.status(400).json({ message: 'Code expired' });
  db.get('users').find({ id: user.id }).assign({ verified: true, otp_code: null, otp_expires: null }).write();
  res.json({ access_token: makeToken(user), user: { id: user.id, email: user.email, role: user.role } });
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  const user = db.get('users').find({ email: email?.toLowerCase() }).value();
  if (!user) return res.status(404).json({ message: 'User not found' });
  const otp = generateOtp();
  db.get('users').find({ id: user.id }).assign({ otp_code: otp, otp_expires: Date.now() + 15 * 60 * 1000 }).write();
  await sendOtpEmail(email, otp);
  res.json({ message: 'OTP resent' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.get('users').find({ email: email?.toLowerCase() }).value();
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.verified) return res.status(401).json({ message: 'Please verify your email first' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ access_token: makeToken(user), user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Login failed' }); }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, otp_code, otp_expires, reset_token, reset_expires, ...safe } = user;
  res.json(safe);
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = db.get('users').find({ email: email?.toLowerCase() }).value();
  if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });
  const token = uuidv4();
  db.get('users').find({ id: user.id }).assign({ reset_token: token, reset_expires: Date.now() + 60 * 60 * 1000 }).write();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  console.log(`\n🔑  Password reset for ${email}:\n    ${resetUrl}\n`);
  res.json({ message: 'If that email exists, a reset link was sent.' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const user = db.get('users').find({ reset_token: resetToken }).value();
  if (!user || Date.now() > user.reset_expires) return res.status(400).json({ message: 'Invalid or expired reset token' });
  const hash = await bcrypt.hash(newPassword, 10);
  db.get('users').find({ id: user.id }).assign({ password: hash, reset_token: null, reset_expires: null }).write();
  res.json({ message: 'Password reset successful' });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => res.json({ message: 'Logged out' }));

module.exports = router;
