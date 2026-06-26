// Run once to create your admin account:
//   node create-admin.js

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const EMAIL    = process.env.ADMIN_EMAIL    || 'admin@shopeasy.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

async function main() {
  const existing = db.get('users').find({ email: EMAIL }).value();
  if (existing) {
    db.get('users').find({ email: EMAIL }).assign({ role: 'admin', verified: true }).write();
    console.log(`\n✅  ${EMAIL} promoted to admin\n`);
    return;
  }
  const hash = await bcrypt.hash(PASSWORD, 10);
  db.get('users').push({
    id: uuidv4(), email: EMAIL, password: hash, role: 'admin',
    full_name: 'Admin', phone: '', address: '',
    otp_code: null, otp_expires: null, verified: true,
    reset_token: null, reset_expires: null,
    created_date: new Date().toISOString(),
  }).write();

  console.log('\n✅  Admin created!');
  console.log(`    Email:    ${EMAIL}`);
  console.log(`    Password: ${PASSWORD}`);
  console.log('\n👉  Login at http://localhost:5173/login\n');
}

main().catch(console.error);
