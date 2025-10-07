// ==========================================
// FILE: backend/models/index.js
// Database Models - All query functions organized by entity
// ==========================================

const pool = require('../config/database');

// ==========================================
// USER MODEL
// ==========================================

const UserModel = {
  // Find user by username
  findByUsername: async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const query = `
      SELECT id, username, email, full_name, phone, role, status, 
             created_at, updated_at, last_login 
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get all users
  findAll: async (filters = {}) => {
    let query = `
      SELECT id, username, email, full_name, phone, role, status, 
             created_at, updated_at, last_login 
      FROM users 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.role) {
      query += ` AND role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  // Create new user
  create: async (userData) => {
    const query = `
      INSERT INTO users 
      (username, email, password_hash, full_name, phone, role, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, username, email, full_name, phone, role, status, created_at
    `;
    const { username, email, password_hash, full_name, phone, role, status } = userData;
    const result = await pool.query(query, [
      username, email, password_hash, full_name, phone, 
      role || 'user', status || 'active'
    ]);
    return result.rows[0];
  },

  // Update user
  update: async (id, userData) => {
    const query = `
      UPDATE users 
      SET full_name = $1, phone = $2, role = $3, status = $4, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $5 
      RETURNING id, username, email, full_name, phone, role, status
    `;
    const { full_name, phone, role, status } = userData;
    const result = await pool.query(query, [full_name, phone, role, status, id]);
    return result.rows[0];
  },

  // Update last login
  updateLastLogin: async (id) => {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [id]);
  },

  // Delete user
  delete: async (id) => {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING username';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get user count by role
  countByRole: async () => {
    const query = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};

// ==========================================
// APPLICATION MODEL
// ==========================================

const ApplicationModel = {
  // Find application by ID
  findById: async (id) => {
    const query = 'SELECT * FROM applications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Find application by number
  findByNumber: async (applicationNumber) => {
    const query = 'SELECT * FROM applications WHERE application_number = $1';
    const result = await pool.query(query, [applicationNumber]);
    return result.rows[0];
  },

  // Get all applications
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM applications WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.user_id) {
      query += ` AND user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.current_stage) {
      query += ` AND current_stage = $${paramCount}`;
      params.push(filters.current_stage);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get applications with user details
  findAllWithUser: async () => {
    const query = `
      SELECT a.*, u.username, u.email as user_email 
      FROM applications a 
      LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Create new application
  create: async (applicationData) => {
    const query = `
      INSERT INTO applications 
      (user_id, applicant_type, full_name, date_of_birth, gender, 
       email, phone, address, city, state, pincode, status, current_stage) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *
    `;
    const {
      user_id, applicant_type, full_name, date_of_birth, gender,
      email, phone, address, city, state, pincode
    } = applicationData;

    const result = await pool.query(query, [
      user_id, applicant_type, full_name, date_of_birth, gender,
      email, phone, address, city, state, pincode, 'draft', 'application'
    ]);
    return result.rows[0];
  },

  // Update application status
  updateStatus: async (id, statusData) => {
    const query = `
      UPDATE applications 
      SET status = $1, current_stage = $2, remarks = $3, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4 
      RETURNING *
    `;
    const { status, current_stage, remarks } = statusData;
    const result = await pool.query(query, [status, current_stage, remarks, id]);
    return result.rows[0];
  },

  // Update application stage
  updateStage: async (id, stage) => {
    const query = `
      UPDATE applications 
      SET current_stage = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [stage, id]);
    return result.rows[0];
  },

  // Get application statistics
  getStats: async () => {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today
      FROM applications
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get applications by stage
  getByStage: async (stage) => {
    const query = 'SELECT * FROM applications WHERE current_stage = $1 ORDER BY updated_at ASC';
    const result = await pool.query(query, [stage]);
    return result.rows;
  }
};

// ==========================================
// DOCUMENT MODEL
// ==========================================

const DocumentModel = {
  // Find documents by application ID
  findByApplicationId: async (applicationId) => {
    const query = `
      SELECT * FROM documents 
      WHERE application_id = $1 
      ORDER BY uploaded_at DESC
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows;
  },

  // Create document record
  create: async (documentData) => {
    const query = `
      INSERT INTO documents 
      (application_id, document_type, document_number, file_path, file_size) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const { application_id, document_type, document_number, file_path, file_size } = documentData;
    const result = await pool.query(query, [
      application_id, document_type, document_number, file_path, file_size
    ]);
    return result.rows[0];
  },

  // Verify document
  verify: async (id, userId, verified, remarks) => {
    const query = `
      UPDATE documents 
      SET verified = $1, verified_by = $2, verified_at = CURRENT_TIMESTAMP, 
          verification_remarks = $3 
      WHERE id = $4 
      RETURNING *
    `;
    const result = await pool.query(query, [verified, userId, remarks, id]);
    return result.rows[0];
  },

  // Get unverified documents
  findUnverified: async () => {
    const query = `
      SELECT d.*, a.application_number, a.full_name 
      FROM documents d 
      JOIN applications a ON d.application_id = a.id 
      WHERE d.verified = false 
      ORDER BY d.uploaded_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};

// ==========================================
// TOKEN MODEL
// ==========================================

const TokenModel = {
  // Find token by application ID
  findByApplicationId: async (applicationId) => {
    const query = 'SELECT * FROM token_records WHERE application_id = $1';
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  },

  // Find token by token number
  findByTokenNumber: async (tokenNumber) => {
    const query = 'SELECT * FROM token_records WHERE token_number = $1';
    const result = await pool.query(query, [tokenNumber]);
    return result.rows[0];
  },

  // Get all tokens
  findAll: async () => {
    const query = `
      SELECT t.*, a.full_name, a.application_number 
      FROM token_records t 
      JOIN applications a ON t.application_id = a.id 
      ORDER BY t.assigned_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Create token
  create: async (tokenData) => {
    const query = `
      INSERT INTO token_records 
      (application_id, token_number, assigned_by, status, valid_until) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const { application_id, token_number, assigned_by, valid_until } = tokenData;
    const result = await pool.query(query, [
      application_id, token_number, assigned_by, 'active', 
      valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ]);
    return result.rows[0];
  },

  // Update token status
  updateStatus: async (id, status) => {
    const query = 'UPDATE token_records SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }
};

// ==========================================
// PHOTO & SIGNATURE MODEL
// ==========================================

const PhotoSignModel = {
  // Find by application ID
  findByApplicationId: async (applicationId) => {
    const query = 'SELECT * FROM photo_sign_validations WHERE application_id = $1';
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  },

  // Get pending validations
  findPending: async () => {
    const query = `
      SELECT psv.*, a.full_name, a.application_number 
      FROM photo_sign_validations psv 
      JOIN applications a ON psv.application_id = a.id 
      WHERE psv.photo_approved = false OR psv.signature_approved = false 
      ORDER BY psv.created_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Create record
  create: async (data) => {
    const query = `
      INSERT INTO photo_sign_validations 
      (application_id, photo_path, signature_path) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const { application_id, photo_path, signature_path } = data;
    const result = await pool.query(query, [application_id, photo_path, signature_path]);
    return result.rows[0];
  },

  // Update validation
  update: async (id, validationData) => {
    const query = `
      UPDATE photo_sign_validations 
      SET photo_approved = $1, signature_approved = $2, 
          photo_remarks = $3, signature_remarks = $4,
          validated_by = $5, validated_at = CURRENT_TIMESTAMP 
      WHERE id = $6 
      RETURNING *
    `;
    const { photo_approved, signature_approved, photo_remarks, signature_remarks, validated_by } = validationData;
    const result = await pool.query(query, [
      photo_approved, signature_approved, photo_remarks, signature_remarks, validated_by, id
    ]);
    return result.rows[0];
  },

  // Upsert (Insert or Update)
  upsert: async (data) => {
    const query = `
      INSERT INTO photo_sign_validations 
      (application_id, photo_path, signature_path) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (application_id) 
      DO UPDATE SET 
        photo_path = COALESCE(EXCLUDED.photo_path, photo_sign_validations.photo_path),
        signature_path = COALESCE(EXCLUDED.signature_path, photo_sign_validations.signature_path)
      RETURNING *
    `;
    const { application_id, photo_path, signature_path } = data;
    const result = await pool.query(query, [application_id, photo_path, signature_path]);
    return result.rows[0];
  }
};

// ==========================================
// VERIFICATION MODEL
// ==========================================

const VerificationModel = {
  // Find by application ID
  findByApplicationId: async (applicationId) => {
    const query = `
      SELECT vr.*, a.full_name, a.application_number 
      FROM verification_records vr 
      JOIN applications a ON vr.application_id = a.id 
      WHERE vr.application_id = $1
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  },

  // Get pending verifications
  findPending: async () => {
    const query = `
      SELECT vr.*, a.full_name, a.application_number, a.email, a.phone 
      FROM verification_records vr 
      JOIN applications a ON vr.application_id = a.id 
      WHERE vr.verification_status = 'pending' 
      ORDER BY vr.created_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Create verification record
  create: async (applicationId) => {
    const query = `
      INSERT INTO verification_records 
      (application_id, verification_status) 
      VALUES ($1, 'pending') 
      RETURNING *
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  },

  // Update verification
  update: async (id, verificationData) => {
    const query = `
      UPDATE verification_records 
      SET aadhaar_verified = $1, pan_verified = $2, dl_verified = $3,
          voter_id_verified = $4, cctns_verified = $5, 
          verification_status = $6, remarks = $7,
          verified_by = $8, verified_at = CURRENT_TIMESTAMP 
      WHERE id = $9 
      RETURNING *
    `;
    const {
      aadhaar_verified, pan_verified, dl_verified, voter_id_verified,
      cctns_verified, verification_status, remarks, verified_by
    } = verificationData;
    const result = await pool.query(query, [
      aadhaar_verified, pan_verified, dl_verified, voter_id_verified,
      cctns_verified, verification_status, remarks, verified_by, id
    ]);
    return result.rows[0];
  }
};

// ==========================================
// PROCESSING MODEL
// ==========================================

const ProcessingModel = {
  // Find by application ID
  findByApplicationId: async (applicationId) => {
    const query = `
      SELECT pr.*, a.full_name, a.application_number, a.address 
      FROM processing_records pr 
      JOIN applications a ON pr.application_id = a.id 
      WHERE pr.application_id = $1
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  },

  // Get pending processing
  findPending: async () => {
    const query = `
      SELECT pr.*, a.full_name, a.application_number, a.address, a.city, a.state 
      FROM processing_records pr 
      JOIN applications a ON pr.application_id = a.id 
      WHERE pr.police_verification_status = 'pending' 
      ORDER BY pr.created_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Create processing record
  create: async (applicationId) => {
    const query = `
      INSERT INTO processing_records 
      (application_id, police_verification_status) 
      VALUES ($1, 'pending') 
      RETURNING *
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  },

  // Update processing
  update: async (id, processingData) => {
    const query = `
      UPDATE processing_records 
      SET police_verification_status = $1, police_station = $2, police_remarks = $3,
          reference1_name = $4, reference1_aadhaar = $5, reference1_verified = $6,
          reference2_name = $7, reference2_aadhaar = $8, reference2_verified = $9,
          processed_by = $10, processed_at = CURRENT_TIMESTAMP 
      WHERE id = $11 
      RETURNING *
    `;
    const {
      police_verification_status, police_station, police_remarks,
      reference1_name, reference1_aadhaar, reference1_verified,
      reference2_name, reference2_aadhaar, reference2_verified,
      processed_by
    } = processingData;
    const result = await pool.query(query, [
      police_verification_status, police_station, police_remarks,
      reference1_name, reference1_aadhaar, reference1_verified,
      reference2_name, reference2_aadhaar, reference2_verified,
      processed_by, id
    ]);
    return result.rows[0];
  }
};

// ==========================================
// APPROVAL MODEL
// ==========================================

const ApprovalModel = {
  // Get pending approvals
  findPending: async () => {
    const query = `
      SELECT a.*, 
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
      ORDER BY a.updated_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all approvals
  findAll: async () => {
    const query = `
      SELECT al.*, a.full_name, a.application_number, u.full_name as approved_by_name 
      FROM approval_logs al 
      JOIN applications a ON al.application_id = a.id 
      LEFT JOIN users u ON al.approved_by = u.id 
      ORDER BY al.decision_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Find by application ID
  findByApplicationId: async (applicationId) => {
    const query = `
      SELECT al.*, a.full_name, a.application_number 
      FROM approval_logs al 
      JOIN applications a ON al.application_id = a.id 
      WHERE al.application_id = $1
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  },

  // Create approval log
  create: async (approvalData) => {
    const query = `
      INSERT INTO approval_logs 
      (application_id, decision, approved_by, comments, 
       passport_number, issue_date, expiry_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const {
      application_id, decision, approved_by, comments,
      passport_number, issue_date, expiry_date
    } = approvalData;
    const result = await pool.query(query, [
      application_id, decision, approved_by, comments,
      passport_number, issue_date, expiry_date
    ]);
    return result.rows[0];
  }
};

// ==========================================
// AUDIT LOG MODEL
// ==========================================

const AuditLogModel = {
  // Create audit log
  create: async (auditData) => {
    const query = `
      INSERT INTO audit_logs 
      (user_id, action, table_name, record_id, changes, ip_address, user_agent) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const { user_id, action, table_name, record_id, changes, ip_address, user_agent } = auditData;
    const result = await pool.query(query, [
      user_id, action, table_name, record_id, changes, ip_address, user_agent
    ]);
    return result.rows[0];
  },

  // Get audit logs
  findAll: async (filters = {}) => {
    let query = `
      SELECT al.*, u.username, u.full_name 
      FROM audit_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.user_id) {
      query += ` AND al.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.action) {
      query += ` AND al.action = $${paramCount}`;
      params.push(filters.action);
      paramCount++;
    }

    if (filters.table_name) {
      query += ` AND al.table_name = $${paramCount}`;
      params.push(filters.table_name);
      paramCount++;
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }
};

// ==========================================
// ADMIN LOG MODEL
// ==========================================

const AdminLogModel = {
  // Create admin log
  create: async (logData) => {
    const query = `
      INSERT INTO admin_logs 
      (admin_id, action_type, target_user_id, description) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const { admin_id, action_type, target_user_id, description } = logData;
    const result = await pool.query(query, [admin_id, action_type, target_user_id, description]);
    return result.rows[0];
  },

  // Get admin logs
  findAll: async (limit = 100) => {
    const query = `
      SELECT al.*, u.username as admin_username, tu.username as target_username
      FROM admin_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      LEFT JOIN users tu ON al.target_user_id = tu.id
      ORDER BY al.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
};

// ==========================================
// EXPORT ALL MODELS
// ==========================================

module.exports = {
  User: UserModel,
  Application: ApplicationModel,
  Document: DocumentModel,
  Token: TokenModel,
  PhotoSign: PhotoSignModel,
  Verification: VerificationModel,
  Processing: ProcessingModel,
  Approval: ApprovalModel,
  AuditLog: AuditLogModel,
  AdminLog: AdminLogModel,
  pool // Export pool for direct queries if needed
};

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*
// In your controllers, import and use like this:

const { User, Application, Document } = require('../models');

// Example: Find user by username
const user = await User.findByUsername('admin_user');

// Example: Get all applications for a user
const apps = await Application.findAll({ user_id: userId });

// Example: Create new application
const newApp = await Application.create({
  user_id: 1,
  applicant_type: 'new',
  full_name: 'John Doe',
  // ... other fields
});

// Example: Get pending verifications
const pending = await Verification.findPending();

// Example: Create audit log
await AuditLog.create({
  user_id: req.user.id,
  action: 'CREATE',
  table_name: 'applications',
  record_id: newApp.id,
  changes: JSON.stringify(newApp),
  ip_address: req.ip,
  user_agent: req.headers['user-agent']
});
*/