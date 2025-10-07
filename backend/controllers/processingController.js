// ==========================================
// FILE: backend/controllers/processingController.js
// Police & Reference Verification Controller
// ==========================================

const pool = require('../config/database');

// Create processing record
const createProcessingRecord = async (req, res) => {
  try {
    const { application_id } = req.body;

    const result = await pool.query(
      `INSERT INTO processing_records 
       (application_id, police_verification_status) 
       VALUES ($1, 'pending') 
       RETURNING *`,
      [application_id]
    );

    res.status(201).json({
      message: 'Processing record created',
      record: result.rows[0]
    });
  } catch (error) {
    console.error('Create processing error:', error);
    res.status(500).json({ error: 'Failed to create processing record' });
  }
};

// Get all pending processing records
const getPendingProcessing = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pr.*, a.full_name, a.application_number, a.address, a.city, a.state 
       FROM processing_records pr 
       JOIN applications a ON pr.application_id = a.id 
       WHERE pr.police_verification_status = 'pending' 
       ORDER BY pr.created_at ASC`
    );

    res.json({ processingRecords: result.rows });
  } catch (error) {
    console.error('Get processing error:', error);
    res.status(500).json({ error: 'Failed to fetch processing records' });
  }
};

// Get processing record by application ID
const getProcessingByAppId = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const result = await pool.query(
      `SELECT pr.*, a.full_name, a.application_number, a.address 
       FROM processing_records pr 
       JOIN applications a ON pr.application_id = a.id 
       WHERE pr.application_id = $1`,
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Processing record not found' });
    }

    res.json({ processing: result.rows[0] });
  } catch (error) {
    console.error('Get processing error:', error);
    res.status(500).json({ error: 'Failed to fetch processing record' });
  }
};

// Update processing record
const updateProcessing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      police_verification_status,
      police_station,
      police_remarks,
      reference1_name,
      reference1_aadhaar,
      reference1_verified,
      reference2_name,
      reference2_aadhaar,
      reference2_verified
    } = req.body;

    const result = await pool.query(
      `UPDATE processing_records 
       SET police_verification_status = $1,
           police_station = $2,
           police_remarks = $3,
           reference1_name = $4,
           reference1_aadhaar = $5,
           reference1_verified = $6,
           reference2_name = $7,
           reference2_aadhaar = $8,
           reference2_verified = $9,
           processed_by = $10,
           processed_at = CURRENT_TIMESTAMP 
       WHERE id = $11 
       RETURNING *`,
      [police_verification_status, police_station, police_remarks,
       reference1_name, reference1_aadhaar, reference1_verified,
       reference2_name, reference2_aadhaar, reference2_verified,
       req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Processing record not found' });
    }

    // Update application stage if processing completed
    if (police_verification_status === 'clear' && reference1_verified && reference2_verified) {
      await pool.query(
        `UPDATE applications 
         SET current_stage = 'final_approval' 
         WHERE id = $1`,
        [result.rows[0].application_id]
      );
    }

    res.json({
      message: 'Processing updated successfully',
      processing: result.rows[0]
    });
  } catch (error) {
    console.error('Update processing error:', error);
    res.status(500).json({ error: 'Failed to update processing' });
  }
};

// Verify reference
const verifyReference = async (req, res) => {
  try {
    const { id, referenceNumber } = req.params;
    const { verified, remarks } = req.body;

    const field = referenceNumber === '1' ? 'reference1_verified' : 'reference2_verified';

    const result = await pool.query(
      `UPDATE processing_records 
       SET ${field} = $1 
       WHERE id = $2 
       RETURNING *`,
      [verified, id]
    );

    res.json({
      message: `Reference ${referenceNumber} verified successfully`,
      processing: result.rows[0]
    });
  } catch (error) {
    console.error('Verify reference error:', error);
    res.status(500).json({ error: 'Failed to verify reference' });
  }
};

module.exports = {
  createProcessingRecord,
  getPendingProcessing,
  getProcessingByAppId,
  updateProcessing,
  verifyReference
};