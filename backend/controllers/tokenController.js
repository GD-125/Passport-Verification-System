// ==========================================
// FILE: backend/controllers/tokenController.js
// ==========================================
const pool = require('../config/database');

const generateToken = async (req, res) => {
  try {
    const { application_id } = req.body;

    const tokenNumber = `TKN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const result = await pool.query(
      `INSERT INTO token_records 
       (application_id, token_number, assigned_by, status) 
       VALUES ($1, $2, $3, 'active') 
       RETURNING *`,
      [application_id, tokenNumber, req.user.id]
    );

    await pool.query(
      `UPDATE applications 
       SET current_stage = 'token_generated', status = 'in_progress' 
       WHERE id = $1`,
      [application_id]
    );

    res.status(201).json({
      message: 'Token generated successfully',
      token: result.rows[0]
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

const getTokens = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, a.full_name, a.application_number 
       FROM token_records t 
       JOIN applications a ON t.application_id = a.id 
       ORDER BY t.assigned_at DESC`
    );

    res.json({ tokens: result.rows });
  } catch (error) {
    console.error('Get tokens error:', error);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
};

module.exports = { generateToken, getTokens };