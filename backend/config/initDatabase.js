// ==========================================
// FILE: backend/config/initDatabase.js
// Database Tables Creation Script
// ==========================================

const { pool } = require('./database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating database tables...');

    // Start transaction
    await client.query('BEGIN');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(15),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'token', 'photo', 'verification', 'processing', 'approval')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // 2. Applications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        place_of_birth VARCHAR(100),
        gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
        address TEXT NOT NULL,
        city VARCHAR(50),
        state VARCHAR(50),
        pincode VARCHAR(10),
        phone VARCHAR(15) NOT NULL,
        email VARCHAR(100) NOT NULL,
        passport_type VARCHAR(20) CHECK (passport_type IN ('normal', 'diplomatic', 'official')),
        status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'token_generated', 'photo_uploaded', 'under_verification', 'police_verification', 'approved', 'rejected', 'completed')),
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'tatkal', 'urgent')),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Applications table created');

    // 3. Tokens Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
        token_number VARCHAR(50) UNIQUE NOT NULL,
        appointment_date DATE,
        appointment_time TIME,
        office_location VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
        generated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tokens table created');

    // 4. Photo Signatures Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS photo_signatures (
        id SERIAL PRIMARY KEY,
        application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
        photo_path VARCHAR(255),
        signature_path VARCHAR(255),
        validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'approved', 'rejected')),
        validation_remarks TEXT,
        validated_by INTEGER REFERENCES users(id),
        validated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Photo Signatures table created');

    // 5. Verifications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verifications (
        id SERIAL PRIMARY KEY,
        application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
        document_type VARCHAR(50),
        document_status VARCHAR(20) DEFAULT 'pending' CHECK (document_status IN ('pending', 'verified', 'rejected')),
        verified_by INTEGER REFERENCES users(id),
        verification_date TIMESTAMP,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Verifications table created');

    // 6. Processing Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS processing (
        id SERIAL PRIMARY KEY,
        application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
        police_station VARCHAR(100),
        reference_number VARCHAR(50) UNIQUE,
        verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_progress', 'completed', 'failed')),
        verification_date DATE,
        processed_by INTEGER REFERENCES users(id),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Processing table created');

    // 7. Approvals Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS approvals (
        id SERIAL PRIMARY KEY,
        application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
        approved_by INTEGER REFERENCES users(id),
        approval_status VARCHAR(20) CHECK (approval_status IN ('approved', 'rejected')),
        approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        passport_number VARCHAR(50),
        issue_date DATE,
        expiry_date DATE,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Approvals table created');

    // 8. Audit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(50),
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Audit Logs table created');

    // 9. Admin Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES users(id),
        action_type VARCHAR(50),
        target_user_id INTEGER REFERENCES users(id),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admin Logs table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_tokens_application_id ON tokens(application_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    `);
    console.log('✅ Indexes created');

    // Commit transaction
    await client.query('COMMIT');
    console.log('🎉 All tables created successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  const bcrypt = require('bcryptjs');
  
  try {
    const password_hash = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@passport.gov', password_hash, 'System Administrator', 'admin', 'active']);
    
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Main initialization function
const initializeDatabase = async () => {
  try {
    await createTables();
    await createDefaultAdmin();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, createTables, createDefaultAdmin };