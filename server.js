if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const violationRoutes = require('./routes/violationRoutes');
const reportRoutes = require('./routes/reports');
const { connectToDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Folder uploads berhasil dibuat');
}

const corsOptions = {
  origin: 'https://sippak.up.railway.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // untuk preflight otomatis

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/exports', express.static(path.join(__dirname, 'exports')));
app.use('/api/report', reportRoutes);
app.use('/api/violations', violationRoutes);

app.all('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} tidak ditemukan.` });
});

console.log('📂 Daftar route yang aktif:');
app._router.stack
  .filter(r => r.route && r.route.path)
  .forEach(r => {
    console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
  });

async function startServer() {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Gagal connect ke DB:', err);
    process.exit(1);
  }
}

startServer();

