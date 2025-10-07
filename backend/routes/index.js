// ==========================================
// FILE: backend/routes/index.js
// Complete API Routes Configuration
// ==========================================

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const auditLog = require('../middleware/auditMiddleware');

// Import all controllers
const authController = require('../controllers/authController');
const applicationController = require('../controllers/applicationController');
const tokenController = require('../controllers/tokenController');
const photoController = require('../controllers/photoController');
const verificationController = require('../controllers/verificationController');
const processingController = require('../controllers/processingController');
const approvalController = require('../controllers/approvalController');
const adminController = require('../controllers/adminController');

// ==========================================
// PUBLIC ROUTES (No Authentication Required)
// ==========================================

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// ==========================================
// PROTECTED ROUTES (Authentication Required)
// ==========================================

// Apply authentication middleware to all routes below
router.use(authenticateToken);
router.use(auditLog);

// ==========================================
// APPLICATION ROUTES
// ==========================================

// All authenticated users can view and create applications
router.get('/applications', applicationController.getApplications);
router.get('/applications/:id', applicationController.getApplicationById);
router.post('/applications', applicationController.createApplication);

// Only specific roles can update applications
router.put('/applications/:id', 
  authorizeRoles('admin', 'approval', 'processing', 'verification'),
  applicationController.updateApplicationStatus
);

// ==========================================
// TOKEN ROUTES
// ==========================================

router.get('/tokens', 
  authorizeRoles('admin', 'token'),
  tokenController.getTokens
);

router.post('/tokens', 
  authorizeRoles('admin', 'token'),
  tokenController.generateToken
);

// ==========================================
// PHOTO & SIGNATURE ROUTES
// ==========================================

router.post('/photo-sign/upload',
  photoController.uploadPhotoSignature
);

router.get('/photo-sign',
  authorizeRoles('admin', 'photo'),
  photoController.getPhotoSignRecords
);

router.get('/photo-sign/application/:applicationId',
  photoController.getByApplicationId
);

router.put('/photo-sign/:id',
  authorizeRoles('admin', 'photo'),
  photoController.validatePhotoSignature
);

// ==========================================
// VERIFICATION ROUTES
// ==========================================

router.post('/verification',
  authorizeRoles('admin', 'verification'),
  verificationController.createVerification
);

router.get('/verification/pending',
  authorizeRoles('admin', 'verification'),
  verificationController.getPendingVerifications
);

router.get('/verification/application/:applicationId',
  verificationController.getVerificationByAppId
);

router.put('/verification/:id',
  authorizeRoles('admin', 'verification'),
  verificationController.updateVerification
);

router.put('/verification/:applicationId/document/:documentType',
  authorizeRoles('admin', 'verification'),
  verificationController.verifyDocument
);

// ==========================================
// PROCESSING ROUTES
// ==========================================

router.post('/processing',
  authorizeRoles('admin', 'processing'),
  processingController.createProcessingRecord
);

router.get('/processing/pending',
  authorizeRoles('admin', 'processing'),
  processingController.getPendingProcessing
);

router.get('/processing/application/:applicationId',
  processingController.getProcessingByAppId
);

router.put('/processing/:id',
  authorizeRoles('admin', 'processing'),
  processingController.updateProcessing
);

router.put('/processing/:id/reference/:referenceNumber',
  authorizeRoles('admin', 'processing'),
  processingController.verifyReference
);

// ==========================================
// APPROVAL ROUTES
// ==========================================

router.get('/approval/pending',
  authorizeRoles('admin', 'approval'),
  approvalController.getPendingApprovals
);

router.get('/approval',
  authorizeRoles('admin', 'approval'),
  approvalController.getAllApprovals
);

router.get('/approval/application/:applicationId',
  approvalController.getApprovalByAppId
);

router.post('/approval/:application_id',
  authorizeRoles('admin', 'approval'),
  approvalController.processApproval
);

router.post('/approval/bulk',
  authorizeRoles('admin', 'approval'),
  approvalController.bulkApprove
);

// ==========================================
// ADMIN ROUTES (Admin Only)
// ==========================================

// User Management
router.get('/admin/users',
  authorizeRoles('admin'),
  adminController.getAllUsers
);

router.get('/admin/users/:id',
  authorizeRoles('admin'),
  adminController.getUserById
);

router.post('/admin/users',
  authorizeRoles('admin'),
  adminController.createUser
);

router.put('/admin/users/:id',
  authorizeRoles('admin'),
  adminController.updateUser
);

router.delete('/admin/users/:id',
  authorizeRoles('admin'),
  adminController.deleteUser
);

// Statistics and Reports
router.get('/admin/statistics',
  authorizeRoles('admin'),
  adminController.getStatistics
);

router.get('/admin/audit-logs',
  authorizeRoles('admin'),
  adminController.getAuditLogs
);

router.get('/admin/admin-logs',
  authorizeRoles('admin'),
  adminController.getAdminLogs
);

router.get('/admin/reports',
  authorizeRoles('admin'),
  adminController.generateReport
);

// ==========================================
// HEALTH CHECK & INFO ROUTES
// ==========================================

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    user: req.user ? req.user.username : 'Not authenticated'
  });
});

router.get('/info', (req, res) => {
  res.json({
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: ['/auth/register', '/auth/login'],
      applications: ['/applications', '/applications/:id'],
      tokens: ['/tokens'],
      photoSign: ['/photo-sign', '/photo-sign/:id'],
      verification: ['/verification', '/verification/:id'],
      processing: ['/processing', '/processing/:id'],
      approval: ['/approval', '/approval/:application_id'],
      admin: ['/admin/users', '/admin/statistics', '/admin/reports']
    }
  });
});

// ==========================================
// ERROR HANDLING - 404 Route Not Found
// ==========================================

router.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

module.exports = router;

// ==========================================
// ROUTE DOCUMENTATION
// ==========================================

/*
AUTHENTICATION ROUTES:
----------------------
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login

APPLICATION ROUTES:
-------------------
GET    /api/applications           - Get all applications (filtered by role)
GET    /api/applications/:id       - Get specific application
POST   /api/applications           - Create new application
PUT    /api/applications/:id       - Update application status

TOKEN ROUTES:
-------------
GET    /api/tokens                 - Get all tokens (token/admin only)
POST   /api/tokens                 - Generate new token (token/admin only)

PHOTO & SIGNATURE ROUTES:
-------------------------
POST   /api/photo-sign/upload      - Upload photo/signature
GET    /api/photo-sign             - Get all photo/sign records (photo/admin only)
GET    /api/photo-sign/application/:id - Get by application
PUT    /api/photo-sign/:id         - Validate photo/signature (photo/admin only)

VERIFICATION ROUTES:
--------------------
POST   /api/verification           - Create verification record (verification/admin only)
GET    /api/verification/pending   - Get pending verifications (verification/admin only)
GET    /api/verification/application/:id - Get verification by application
PUT    /api/verification/:id       - Update verification (verification/admin only)
PUT    /api/verification/:appId/document/:type - Verify document (verification/admin only)

PROCESSING ROUTES:
------------------
POST   /api/processing             - Create processing record (processing/admin only)
GET    /api/processing/pending     - Get pending processing (processing/admin only)
GET    /api/processing/application/:id - Get processing by application
PUT    /api/processing/:id         - Update processing (processing/admin only)
PUT    /api/processing/:id/reference/:num - Verify reference (processing/admin only)

APPROVAL ROUTES:
----------------
GET    /api/approval/pending       - Get pending approvals (approval/admin only)
GET    /api/approval               - Get all approvals (approval/admin only)
GET    /api/approval/application/:id - Get approval by application
POST   /api/approval/:id           - Process approval/rejection (approval/admin only)
POST   /api/approval/bulk          - Bulk approve applications (approval/admin only)

ADMIN ROUTES:
-------------
GET    /api/admin/users            - Get all users (admin only)
GET    /api/admin/users/:id        - Get user by ID (admin only)
POST   /api/admin/users            - Create new user (admin only)
PUT    /api/admin/users/:id        - Update user (admin only)
DELETE /api/admin/users/:id        - Delete user (admin only)
GET    /api/admin/statistics       - Get system statistics (admin only)
GET    /api/admin/audit-logs       - Get audit logs (admin only)
GET    /api/admin/admin-logs       - Get admin action logs (admin only)
GET    /api/admin/reports          - Generate reports (admin only)

UTILITY ROUTES:
---------------
GET    /api/health                 - Health check
GET    /api/info                   - API information

ROLE-BASED ACCESS:
------------------
user         - Can create and view own applications
token        - Can generate tokens
photo        - Can validate photos and signatures
verification - Can verify documents
processing   - Can process applications (police verification)
approval     - Can approve/reject applications
admin        - Can access all routes and manage users
*/