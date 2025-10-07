// ==========================================
// FILE: backend/controllers/authController.js
// ==========================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, role } = req.body;

    // Check if user exists using model
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user using model
    const user = await User.create({
      username,
      email,
      password_hash,
      full_name,
      phone,
      role: role || 'user',
      status: 'active'
    });

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user using model
    const user = await User.findByUsername(username);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { register, login };
