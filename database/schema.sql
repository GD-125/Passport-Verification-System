-- ==========================================
-- FILE: database/schema.sql
-- PostgreSQL Database Schema for Passport Verification System
-- ==========================================

-- Create Database
CREATE DATABASE passport_verification_db;

-- Connect to database
\c passport_verification_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE - All system users
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'token', 'photo', 'verification', 'processing', 'approval', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ==========================================
-- 2. APPLICATIONS TABLE - Passport applications
-- ==========================================
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    application_number VARCHAR(20) UNIQUE DEFAULT 'APP' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || LPAD(nextval('applications_id_seq')::TEXT, 6, '0'),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    applicant_type VARCHAR(20) CHECK (applicant_type IN ('new', 'renewal', 'reissue')),
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_progress', 'approved', 'rejected', 'on_hold')),
    current_stage VARCHAR(30) DEFAULT 'application' CHECK (current_stage IN ('application', 'token_generated', 'photo_validation', 'document_verification', 'police_verification', 'final_approval')),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_stage ON applications(current_stage);

-- ==========================================
-- 3. DOCUMENTS TABLE - Uploaded documents
-- ==========================================
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'driving_license', 'voter_id', 'marksheet_10th', 'birth_certificate')),
    document_number VARCHAR(50),
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    verification_remarks TEXT
);

CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- ==========================================
-- 4. TOKEN_RECORDS TABLE - Token assignment
-- ==========================================
CREATE TABLE token_records (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    token_number VARCHAR(30) UNIQUE NOT NULL,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    valid_until TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
    remarks TEXT
);

CREATE INDEX idx_token_application ON token_records(application_id);
CREATE INDEX idx_token_status ON token_records(status);

-- ==========================================
-- 5. PHOTO_SIGN_VALIDATIONS TABLE
-- ==========================================
CREATE TABLE photo_sign_validations (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    photo_path VARCHAR(255),
    signature_path VARCHAR(255),
    photo_approved BOOLEAN DEFAULT FALSE,
    signature_approved BOOLEAN DEFAULT FALSE,
    validated_by INTEGER REFERENCES users(id),
    validated_at TIMESTAMP,
    photo_remarks TEXT,
    signature_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photo_application ON photo_sign_validations(application_id);

-- ==========================================
-- 6. VERIFICATION_RECORDS TABLE
-- ==========================================
CREATE TABLE verification_records (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    aadhaar_verified BOOLEAN DEFAULT FALSE,
    pan_verified BOOLEAN DEFAULT FALSE,
    dl_verified BOOLEAN DEFAULT FALSE,
    voter_id_verified BOOLEAN DEFAULT FALSE,
    cctns_verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'completed', 'failed')),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_application ON verification_records(application_id);

-- ==========================================
-- 7. PROCESSING_RECORDS TABLE
-- ==========================================
CREATE TABLE processing_records (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    police_verification_status VARCHAR(20) CHECK (police_verification_status IN ('pending', 'clear', 'adverse', 'not_applicable')),
    police_station VARCHAR(100),
    police_remarks TEXT,
    reference1_name VARCHAR(100),
    reference1_aadhaar VARCHAR(12),
    reference1_verified BOOLEAN DEFAULT FALSE,
    reference2_name VARCHAR(100),
    reference2_aadhaar VARCHAR(12),
    reference2_verified BOOLEAN DEFAULT FALSE,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_processing_application ON processing_records(application_id);

-- ==========================================
-- 8. APPROVAL_LOGS TABLE
-- ==========================================
CREATE TABLE approval_logs (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('approved', 'rejected', 'returned')),
    approved_by INTEGER REFERENCES users(id),
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    passport_number VARCHAR(20),
    issue_date DATE,
    expiry_date DATE
);

CREATE INDEX idx_approval_application ON approval_logs(application_id);
CREATE INDEX idx_approval_decision ON approval_logs(decision);

-- ==========================================
-- 9. AUDIT_LOGS TABLE - System audit trail
-- ==========================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(20) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ==========================================
-- 10. ADMIN_LOGS TABLE
-- ==========================================
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    target_user_id INTEGER REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SAMPLE DATA INSERTION
-- ==========================================

-- Insert Users (Password: 'password123' hashed with bcrypt)
-- Hash: $2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW
INSERT INTO users (username, email, password_hash, full_name, phone, role, status) VALUES
('admin_user', 'admin@passport.gov.in', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Admin Kumar', '9876543210', 'admin', 'active'),
('token_officer1', 'token1@passport.gov.in', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Token Officer Sharma', '9876543211', 'token', 'active'),
('photo_officer1', 'photo1@passport.gov.in', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Photo Validator Singh', '9876543212', 'photo', 'active'),
('verify_officer1', 'verify1@passport.gov.in', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Verification Officer Patel', '9876543213', 'verification', 'active'),
('process_officer1', 'process1@passport.gov.in', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Processing Officer Reddy', '9876543214', 'processing', 'active'),
('approval_officer1', 'approval1@passport.gov.in', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Approval Officer Gupta', '9876543215', 'approval', 'active'),
('rajesh_kumar', 'rajesh.k@gmail.com', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Rajesh Kumar', '9123456780', 'user', 'active'),
('priya_sharma', 'priya.s@gmail.com', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Priya Sharma', '9123456781', 'user', 'active'),
('amit_patel', 'amit.p@gmail.com', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Amit Patel', '9123456782', 'user', 'active'),
('sneha_reddy', 'sneha.r@gmail.com', '$2a$10$rFvJKqKEWqKJKqWKqEWqKO7YPTJdJKqKEWqKJKqWKqEWqKJKqW', 'Sneha Reddy', '9123456783', 'user', 'active');

-- Insert Applications
INSERT INTO applications (user_id, applicant_type, full_name, date_of_birth, gender, email, phone, address, city, state, pincode, status, current_stage, submitted_at) VALUES
(7, 'new', 'Rajesh Kumar', '1990-05-15', 'Male', 'rajesh.k@gmail.com', '9123456780', '123 MG Road, Sector 12', 'Mumbai', 'Maharashtra', '400001', 'in_progress', 'token_generated', '2025-10-01 10:30:00'),
(8, 'renewal', 'Priya Sharma', '1985-08-22', 'Female', 'priya.s@gmail.com', '9123456781', '456 Park Street, Salt Lake', 'Kolkata', 'West Bengal', '700001', 'in_progress', 'photo_validation', '2025-10-02 11:15:00'),
(9, 'new', 'Amit Patel', '1992-12-10', 'Male', 'amit.p@gmail.com', '9123456782', '789 Ring Road, Vastrapur', 'Ahmedabad', 'Gujarat', '380015', 'in_progress', 'document_verification', '2025-10-03 09:45:00'),
(10, 'new', 'Sneha Reddy', '1995-03-18', 'Female', 'sneha.r@gmail.com', '9123456783', '321 Jubilee Hills, Banjara', 'Hyderabad', 'Telangana', '500033', 'submitted', 'application', '2025-10-04 14:20:00'),
(7, 'reissue', 'Rajesh Kumar', '1990-05-15', 'Male', 'rajesh.k@gmail.com', '9123456780', '123 MG Road, Sector 12', 'Mumbai', 'Maharashtra', '400001', 'approved', 'final_approval', '2025-09-15 10:00:00'),
(8, 'new', 'Priya Sharma', '1985-08-22', 'Female', 'priya.s@gmail.com', '9123456781', '456 Park Street, Salt Lake', 'Kolkata', 'West Bengal', '700001', 'in_progress', 'police_verification', '2025-09-28 12:30:00'),
(9, 'new', 'Vikram Singh', '1988-07-25', 'Male', 'vikram.s@gmail.com', '9123456784', '555 Rajpath, Connaught Place', 'New Delhi', 'Delhi', '110001', 'submitted', 'token_generated', '2025-10-05 08:00:00'),
(10, 'renewal', 'Anjali Verma', '1993-11-30', 'Female', 'anjali.v@gmail.com', '9123456785', '678 Brigade Road, MG Road', 'Bangalore', 'Karnataka', '560001', 'in_progress', 'document_verification', '2025-10-04 16:45:00'),
(7, 'new', 'Karan Mehta', '1991-01-08', 'Male', 'karan.m@gmail.com', '9123456786', '900 Lake Road, Napeansea', 'Mumbai', 'Maharashtra', '400006', 'draft', 'application', NULL),
(8, 'new', 'Divya Nair', '1994-09-12', 'Female', 'divya.n@gmail.com', '9123456787', '234 Marine Drive, Fort', 'Chennai', 'Tamil Nadu', '600001', 'on_hold', 'photo_validation', '2025-10-03 13:00:00');

-- Insert Documents
INSERT INTO documents (application_id, document_type, document_number, file_path, file_size, verified, verified_by, verified_at) VALUES
(1, 'aadhaar', '1234-5678-9012', '/uploads/documents/app1_aadhaar.pdf', 245632, true, 4, '2025-10-01 15:30:00'),
(1, 'pan', 'ABCDE1234F', '/uploads/documents/app1_pan.pdf', 198234, true, 4, '2025-10-01 15:35:00'),
(2, 'aadhaar', '2345-6789-0123', '/uploads/documents/app2_aadhaar.pdf', 267891, true, 4, '2025-10-02 16:20:00'),
(2, 'voter_id', 'VID2345678', '/uploads/documents/app2_voterid.pdf', 187654, true, 4, '2025-10-02 16:25:00'),
(3, 'aadhaar', '3456-7890-1234', '/uploads/documents/app3_aadhaar.pdf', 234567, false, NULL, NULL),
(3, 'driving_license', 'DL1234567890123', '/uploads/documents/app3_dl.pdf', 298765, false, NULL, NULL),
(4, 'aadhaar', '4567-8901-2345', '/uploads/documents/app4_aadhaar.pdf', 256789, false, NULL, NULL),
(5, 'aadhaar', '1234-5678-9012', '/uploads/documents/app5_aadhaar.pdf', 245632, true, 4, '2025-09-16 10:30:00'),
(6, 'pan', 'FGHIJ5678K', '/uploads/documents/app6_pan.pdf', 203456, true, 4, '2025-09-29 11:15:00'),
(7, 'marksheet_10th', 'MK987654321', '/uploads/documents/app7_10th.pdf', 312456, false, NULL, NULL);

-- Insert Token Records
INSERT INTO token_records (application_id, token_number, assigned_by, status, valid_until) VALUES
(1, 'TKN1696425600123', 2, 'used', '2025-10-31 23:59:59'),
(2, 'TKN1696512000456', 2, 'used', '2025-11-01 23:59:59'),
(3, 'TKN1696598400789', 2, 'active', '2025-11-02 23:59:59'),
(7, 'TKN1696771200321', 2, 'active', '2025-11-04 23:59:59');

-- Insert Photo & Signature Validations
INSERT INTO photo_sign_validations (application_id, photo_path, signature_path, photo_approved, signature_approved, validated_by, validated_at, photo_remarks, signature_remarks) VALUES
(1, '/uploads/photos/app1_photo.jpg', '/uploads/signatures/app1_sign.png', true, true, 3, '2025-10-01 17:00:00', 'Clear photo, meets standards', 'Valid signature'),
(2, '/uploads/photos/app2_photo.jpg', '/uploads/signatures/app2_sign.png', true, false, 3, '2025-10-02 18:30:00', 'Photo approved', 'Signature needs to be redone - not clear'),
(3, '/uploads/photos/app3_photo.jpg', '/uploads/signatures/app3_sign.png', false, false, NULL, NULL, NULL, NULL);

-- Insert Verification Records
INSERT INTO verification_records (application_id, aadhaar_verified, pan_verified, dl_verified, voter_id_verified, cctns_verified, verified_by, verified_at, verification_status, remarks) VALUES
(1, true, true, false, false, true, 4, '2025-10-01 18:30:00', 'completed', 'All primary documents verified successfully'),
(2, true, false, false, true, true, 4, '2025-10-02 19:15:00', 'completed', 'Voter ID and Aadhaar verified'),
(3, true, true, false, false, false, 4, '2025-10-03 14:20:00', 'pending', 'CCTNS verification pending');

-- Insert Processing Records
INSERT INTO processing_records (application_id, police_verification_status, police_station, police_remarks, reference1_name, reference1_aadhaar, reference1_verified, reference2_name, reference2_aadhaar, reference2_verified, processed_by, processed_at) VALUES
(1, 'clear', 'Bandra Police Station', 'No adverse records found', 'Suresh Iyer', '567890123456', true, 'Ramesh Nair', '678901234567', true, 5, '2025-10-02 10:00:00'),
(2, 'pending', 'Salt Lake Police Station', 'Verification in progress', 'Amit Banerjee', '789012345678', true, 'Rajiv Das', '890123456789', false, 5, '2025-10-03 11:30:00'),
(6, 'clear', 'Park Street Police Station', 'Cleared', 'Sourav Ghosh', '901234567890', true, 'Priti Sen', '012345678901', true, 5, '2025-09-30 15:45:00');

-- Insert Approval Logs
INSERT INTO approval_logs (application_id, decision, approved_by, decision_date, comments, passport_number, issue_date, expiry_date) VALUES
(5, 'approved', 6, '2025-09-20 16:00:00', 'All verifications completed successfully. Passport approved for reissue.', 'Z1234567', '2025-09-22', '2035-09-21'),
(1, 'approved', 6, '2025-10-03 10:30:00', 'New passport application approved', 'Z2345678', '2025-10-05', '2035-10-04');

-- Insert Audit Logs
INSERT INTO audit_logs (user_id, action, table_name, record_id, changes, ip_address, user_agent) VALUES
(1, 'INSERT', 'users', 7, '{"username": "rajesh_kumar", "role": "user"}', '192.168.1.100', 'Mozilla/5.0'),
(2, 'INSERT', 'token_records', 1, '{"token_number": "TKN1696425600123"}', '192.168.1.101', 'Mozilla/5.0'),
(3, 'UPDATE', 'photo_sign_validations', 1, '{"photo_approved": true}', '192.168.1.102', 'Mozilla/5.0'),
(4, 'UPDATE', 'verification_records', 1, '{"verification_status": "completed"}', '192.168.1.103', 'Mozilla/5.0'),
(5, 'INSERT', 'processing_records', 1, '{"police_verification_status": "clear"}', '192.168.1.104', 'Mozilla/5.0'),
(6, 'INSERT', 'approval_logs', 1, '{"decision": "approved"}', '192.168.1.105', 'Mozilla/5.0');

-- Insert Admin Logs
INSERT INTO admin_logs (admin_id, action_type, target_user_id, description) VALUES
(1, 'user_created', 7, 'Created new user account for Rajesh Kumar'),
(1, 'user_activated', 8, 'Activated user account for Priya Sharma'),
(1, 'role_assigned', 2, 'Assigned token_officer role to user'),
(1, 'system_config', NULL, 'Updated system configuration settings');

-- ==========================================
-- USEFUL QUERIES
-- ==========================================

-- Get all applications with user details
-- SELECT a.*, u.full_name as applicant_name FROM applications a JOIN users u ON a.user_id = u.id;

-- Get pending applications count by stage
-- SELECT current_stage, COUNT(*) FROM applications WHERE status = 'in_progress' GROUP BY current_stage;

-- Get officer workload
-- SELECT role, COUNT(*) as active_users FROM users WHERE status = 'active' AND role != 'user' GROUP BY role;

-- Get application processing timeline
-- SELECT a.application_number, a.created_at, t.assigned_at, p.validated_at, v.verified_at, pr.processed_at, ap.decision_date
-- FROM applications a
-- LEFT JOIN token_records t ON a.id = t.application_id
-- LEFT JOIN photo_sign_validations p ON a.id = p.application_id
-- LEFT JOIN verification_records v ON a.id = v.application_id
-- LEFT JOIN processing_records pr ON a.id = pr.application_id
-- LEFT JOIN approval_logs ap ON a.id = ap.application_id;

-- ==========================================
-- TRIGGER FUNCTIONS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VIEWS FOR REPORTING
-- ==========================================

CREATE VIEW application_summary AS
SELECT 
    a.id,
    a.application_number,
    a.full_name,
    a.status,
    a.current_stage,
    u.username as applicant_username,
    t.token_number,
    v.verification_status,
    pr.police_verification_status,
    ap.decision,
    a.created_at,
    a.updated_at
FROM applications a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN token_records t ON a.id = t.application_id
LEFT JOIN verification_records v ON a.id = v.application_id
LEFT JOIN processing_records pr ON a.id = pr.application_id
LEFT JOIN approval_logs ap ON a.id = ap.application_id;

CREATE VIEW daily_statistics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count
FROM applications
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ==========================================
-- GRANTS (Optional - for security)
-- ==========================================

-- Create roles
-- CREATE ROLE passport_admin;
-- CREATE ROLE passport_officer;
-- CREATE ROLE passport_user;

-- Grant permissions
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO passport_admin;
-- GRANT SELECT, INSERT, UPDATE ON applications, documents TO passport_user;
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO passport_officer;