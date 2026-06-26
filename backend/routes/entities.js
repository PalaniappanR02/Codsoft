const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { adminMiddleware, optionalAuth } = require('../middleware/auth');

// Map URL segment → db collection name
const TABLE_MAP = {
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  coupons: 'coupons',
  reviews: 'reviews',
  'store-settings': 'store_settings',
  store_settings: 'store_settings',
};

// Fields allowed in filter().where() for each collection
const FILTER_FIELDS = {
  products:       ['active', 'featured', 'category_id', 'slug', 'track_inventory'],
  categories:     ['active'],
  orders:         ['customer_email', 'status'],
  reviews:        ['product_id', 'status'],
  coupons:        ['active', 'code'],
  store_settings: [],
};

function getCollection(table) {
  const col = TABLE_MAP[table];
  if (!col) return null;
  return db.get(col);
}

function buildSort(sort) {
  if (!sort) return { key: 'created_date', order: 'desc' };
  const desc = sort.startsWith('-');
  return { key: desc ? sort.slice(1) : sort, order: desc ? 'desc' : 'asc' };
}

function sortAndLimit(arr, sort, limit) {
  const { key, order } = buildSort(sort);
  const sorted = [...arr].sort((a, b) => {
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return limit ? sorted.slice(0, parseInt(limit)) : sorted;
}

// ── GET list ─────────────────────────────────────────────────
router.get('/:table', optionalAuth, (req, res) => {
  const col = getCollection(req.params.table);
  if (!col) return res.status(404).json({ message: 'Unknown entity' });
  const { sort, limit } = req.query;
  const rows = col.value();
  res.json(sortAndLimit(rows, sort, limit));
});

// ── POST filter ───────────────────────────────────────────────
router.post('/:table/filter', optionalAuth, (req, res) => {
  const col = getCollection(req.params.table);
  if (!col) return res.status(404).json({ message: 'Unknown entity' });
  const { where = {}, sort, limit } = req.body;
  const allowed = FILTER_FIELDS[TABLE_MAP[req.params.table]] || [];

  let rows = col.value();

  // Apply where filters
  Object.entries(where).forEach(([key, val]) => {
    if (!allowed.includes(key)) return;
    rows = rows.filter(r => r[key] === val);
  });

  res.json(sortAndLimit(rows, sort, limit));
});

// ── GET one ───────────────────────────────────────────────────
router.get('/:table/:id', optionalAuth, (req, res) => {
  const col = getCollection(req.params.table);
  if (!col) return res.status(404).json({ message: 'Unknown entity' });
  const row = col.find({ id: req.params.id }).value();
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json(row);
});

// ── POST create ───────────────────────────────────────────────
router.post('/:table', adminMiddleware, (req, res) => {
  const col = getCollection(req.params.table);
  if (!col) return res.status(404).json({ message: 'Unknown entity' });
  const record = { id: uuidv4(), created_date: new Date().toISOString(), ...req.body };
  col.push(record).write();
  res.status(201).json(record);
});

// ── PUT update ────────────────────────────────────────────────
router.put('/:table/:id', adminMiddleware, (req, res) => {
  const col = getCollection(req.params.table);
  if (!col) return res.status(404).json({ message: 'Unknown entity' });
  const existing = col.find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const { id, created_date, ...updates } = req.body;
  col.find({ id: req.params.id }).assign(updates).write();
  const updated = col.find({ id: req.params.id }).value();
  res.json(updated);
});

// ── DELETE ────────────────────────────────────────────────────
router.delete('/:table/:id', adminMiddleware, (req, res) => {
  const col = getCollection(req.params.table);
  if (!col) return res.status(404).json({ message: 'Unknown entity' });
  const existing = col.find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ message: 'Not found' });
  col.remove({ id: req.params.id }).write();
  res.status(204).send();
});

module.exports = router;
