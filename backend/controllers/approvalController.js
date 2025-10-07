// ==========================================
// FILE: backend/controllers/approvalController.js
// Final Approval Controller
// ==========================================

const pool = require('../config/database');

// Get applications pending approval
const getPendingApprovals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
              vr.verification_status,
              pr.police_verification_status,
              psv.photo_approved,
              psv.signature_approved
       FROM applications a
       LEFT JOIN verification_records vr ON a.id = vr.application_id
       LEFT JOIN processing_records pr ON a.id = pr.application_id
       LEFT JOIN photo_sign_validations psv ON a.id = psv.application_id
       WHERE a.current_stage = 'final_approval' 
         AND a.status = 'in_progress'
       ORDER BY a.updated_at ASC`
    );

    res.json({ applications: result.rows });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};

// Get all approval logs
const getAllApprovals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT al.*, a.full_name, a.application_number, u.full_name as approved_by_name 
       FROM approval_logs al 
       JOIN applications a ON al.application_id = a.id 
       LEFT JOIN users u ON al.approved_by = u.id 
       ORDER BY al.decision_date DESC`
    );

    res.json({ approvals: result.rows });
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
};

// Get approval by application ID
const getApprovalByAppId = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const result = await pool.query(
      `SELECT al.*, a.full_name, a.application_number 
       FROM approval_logs al 
       JOIN applications a ON al.application_id = a.id 
       WHERE al.application_id = $1`,
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Approval record not found' });
    }

    res.json({ approval: result.rows[0] });
  } catch (error) {
    console.error('Get approval error:', error);
    res.status(500).json({ error: 'Failed to fetch approval' });
  }
};

// Approve or reject application
const processApproval = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { application_id } = req.params;
    const { decision, comments, passport_number, issue_date, expiry_date } = req.body;

    // Validate decision
    if (!['approved', 'rejected', 'returned'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision value' });
    }

    // Create approval log
    const approvalResult = await client.query(
      `INSERT INTO approval_logs 
       (application_id, decision, approved_by, comments, passport_number, issue_date, expiry_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [application_id, decision, req.user.id, comments, 
       passport_number, issue_date, expiry_date]
    );

    // Update application status
    const newStatus = decision === 'approved' ? 'approved' : 
                     decision === 'rejected' ? 'rejected' : 'on_hold';
    
    const approvedAt = decision === 'approved' ? 'CURRENT_TIMESTAMP' : 'NULL';

    await client.query(
      `UPDATE applications 
       SET status = $1, 
           approved_at = ${approvedAt},
           remarks = $2 
       WHERE id = $3`,
      [newStatus, comments, application_id]
    );

    await client.query('COMMIT');

    res.json({
      message: `Application ${decision} successfully`,
      approval: approvalResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Process approval error:', error);
    res.status(500).json({ error: 'Failed to process approval' });
  } finally {
    client.release();
  }
};

// Generate passport number (helper function)
const generatePassportNumber = () => {
  const prefix = 'Z';
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${randomNum}`;
};

// Bulk approve applications
const bulkApprove = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { application_ids, comments } = req.body;

    const results = [];
    for (const appId of application_ids) {
      const passportNum = generatePassportNumber();
      const issueDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 10);

      const result = await client.query(
        `INSERT INTO approval_logs 
         (application_id, decision, approved_by, comments, passport_number, issue_date, expiry_date) 
         VALUES ($1, 'approved', $2, $3, $4, $5, $6) 
         RETURNING *`,
        [appId, req.user.id, comments, passportNum, issueDate, expiryDate]
      );

      await client.query(
        `UPDATE applications 
         SET status = 'approved', approved_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [appId]
      );

      results.push(result.rows[0]);
    }

    await client.query('COMMIT');

    res.json({
      message: `${results.length} applications approved successfully`,
      approvals: results
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bulk approve error:', error);
    res.status(500).json({ error: 'Failed to bulk approve applications' });
  } finally {
    client.release();
  }
};

module.exports = {
  getPendingApprovals,
  getAllApprovals,
  getApprovalByAppId,
  processApproval,
  bulkApprove,
  generatePassportNumber
};
