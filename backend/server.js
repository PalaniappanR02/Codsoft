require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api',        require('./routes/entities'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ message: `${req.method} ${req.path} not found` }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: err.message }); });

app.listen(PORT, () => {
  console.log(`\n🚀  E-Market API →  http://localhost:${PORT}`);
  console.log(`    Health check →  http://localhost:${PORT}/api/health\n`);
});
