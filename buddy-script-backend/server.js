const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Buddy Script API Server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;

// Database Sync & Server Start
// { alter: true } updates the schema in Supabase if you change your models
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Supabase PostgreSQL Connected & Models Synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });
