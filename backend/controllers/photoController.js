// ==========================================
// FILE: backend/controllers/photoController.js
// Photo & Signature Validation Controller
// ==========================================

const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'photo' ? 
      './uploads/photos/' : './uploads/signatures/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, JPG, PNG) are allowed'));
  }
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

// Upload photo and signature
const uploadPhotoSignature = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { application_id } = req.body;
      const photoPath = req.files['photo'] ? req.files['photo'][0].path : null;
      const signaturePath = req.files['signature'] ? req.files['signature'][0].path : null;

      if (!photoPath && !signaturePath) {
        return res.status(400).json({ error: 'At least one file (photo or signature) is required' });
      }

      const result = await pool.query(
        `INSERT INTO photo_sign_validations 
         (application_id, photo_path, signature_path) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (application_id) 
         DO UPDATE SET 
           photo_path = COALESCE(EXCLUDED.photo_path, photo_sign_validations.photo_path),
           signature_path = COALESCE(EXCLUDED.signature_path, photo_sign_validations.signature_path)
         RETURNING *`,
        [application_id, photoPath, signaturePath]
      );

      await pool.query(
        `UPDATE applications 
         SET current_stage = 'photo_validation', status = 'in_progress' 
         WHERE id = $1`,
        [application_id]
      );

      res.status(201).json({
        message: 'Files uploaded successfully',
        data: result.rows[0]
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
};

// Get photo/signature validation records
const getPhotoSignRecords = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT psv.*, a.full_name, a.application_number, a.status 
       FROM photo_sign_validations psv 
       JOIN applications a ON psv.application_id = a.id 
       WHERE psv.photo_approved = FALSE OR psv.signature_approved = FALSE 
       ORDER BY psv.created_at DESC`
    );

    res.json({ records: result.rows });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
};

// Get photo/signature by application ID
const getByApplicationId = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const result = await pool.query(
      `SELECT * FROM photo_sign_validations WHERE application_id = $1`,
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ record: result.rows[0] });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
};

// Validate photo and signature
const validatePhotoSignature = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      photo_approved,
      signature_approved,
      photo_remarks,
      signature_remarks
    } = req.body;

    const result = await pool.query(
      `UPDATE photo_sign_validations 
       SET photo_approved = $1, 
           signature_approved = $2, 
           photo_remarks = $3, 
           signature_remarks = $4,
           validated_by = $5,
           validated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 
       RETURNING *`,
      [photo_approved, signature_approved, photo_remarks, signature_remarks, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Update application stage if both approved
    if (photo_approved && signature_approved) {
      await pool.query(
        `UPDATE applications 
         SET current_stage = 'document_verification' 
         WHERE id = $1`,
        [result.rows[0].application_id]
      );
    }

    res.json({
      message: 'Validation completed successfully',
      record: result.rows[0]
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Failed to validate' });
  }
};

module.exports = {
  uploadPhotoSignature,
  getPhotoSignRecords,
  getByApplicationId,
  validatePhotoSignature
};
