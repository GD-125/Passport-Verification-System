# Passport Verification and Approval System

## 🎯 Project Overview

A comprehensive multi-role web-based passport verification system with 7 distinct user roles, secure authentication, document management, and complete audit trail.

## 📁 Project Structure

```
passport-verification-system/
├── backend/
│   ├── config/
│   │   └── database.js                 # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js           # Authentication logic
│   │   ├── applicationController.js    # Application management
│   │   ├── tokenController.js          # Token generation
│   │   ├── photoController.js          # Photo validation
│   │   ├── verificationController.js   # Document verification
│   │   ├── processingController.js     # Police verification
│   │   ├── approvalController.js       # Final approval
│   │   └── adminController.js          # Admin operations
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT authentication
│   │   └── auditMiddleware.js          # Audit logging
│   ├── routes/
│   │   └── index.js                    # API routes
│   ├── uploads/                        # File storage
│   │   ├── documents/
│   │   ├── photos/
│   │   └── signatures/
│   ├── .env                            # Environment variables
│   ├── server.js                       # Express server
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── PassportSystem.jsx      # Main React component
│   │   ├── services/
│   │   │   └── api.js                  # API service layer
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   └── package.json
│
└── database/
    └── schema.sql                      # PostgreSQL schema + data
```

## 🚀 Features

### User Roles & Capabilities

1. **User Login (Applicant)**
   - Register and create profile
   - Submit passport applications
   - Upload documents (Aadhaar, PAN, DL, Voter ID, 10th Marksheet)
   - Capture photo and digital signature
   - Track application status in real-time

2. **Token Authenticator**
   - Generate unique tokens for applications
   - Assign tokens to new submissions
   - Track token validity

3. **Photo & Sign Validator**
   - Validate applicant photos
   - Verify digital signatures
   - Approve/reject with remarks

4. **Verification Officer**
   - Cross-check documents with government databases
   - Verify Aadhaar, PAN, DL, Voter ID
   - CCTNS verification
   - Preliminary document checks

5. **Processing Officer**
   - Police record verification
   - Neighbor verification (2 references with Aadhaar)
   - Background checks

6. **Approval Officer**
   - Final review of all verifications
   - Approve/reject applications
   - Generate passport numbers

7. **Admin**
   - All-access privileges
   - Monitor all workflows
   - User management
   - Generate reports
   - System configuration

### Security Features

- ✅ Role-based access control (RBAC)
- ✅ JWT authentication with 24-hour expiry
- ✅ Bcrypt password hashing
- ✅ Complete audit trail for all actions
- ✅ SQL injection prevention
- ✅ Session management
- ✅ IP address logging

### Database Features

- ✅ 9 dedicated tables for different modules
- ✅ Referential integrity with foreign keys
- ✅ Automatic timestamp updates via triggers
- ✅ Database views for reporting
- ✅ Audit logging for INSERT/UPDATE/DELETE
- ✅ Sample data with 10+ entries per table

## 🛠️ Installation Guide

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Database Setup

```bash
# Install PostgreSQL (if not installed)
# For Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# For macOS:
brew install postgresql

# Start PostgreSQL service
sudo service postgresql start  # Linux
brew services start postgresql # macOS

# Create database and run schema
psql -U postgres
# Then run the schema.sql file
\i database/schema.sql
```

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=passport_verification_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
EOL

# Start the server
npm start

# For development with auto-reload
npm run dev
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Passport Verification System
EOL

# Start React application
npm start
```

The application will open at `http://localhost:3000`

## 🔐 Login Credentials

### Sample User Accounts

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | admin_user | password123 | Full system access |
| Token Officer | token_officer1 | password123 | Generate tokens |
| Photo Validator | photo_officer1 | password123 | Validate photos/signatures |
| Verification Officer | verify_officer1 | password123 | Document verification |
| Processing Officer | process_officer1 | password123 | Police verification |
| Approval Officer | approval_officer1 | password123 | Final approval |
| User (Applicant) | rajesh_kumar | password123 | Submit applications |
| User (Applicant) | priya_sharma | password123 | Submit applications |

## 📊 Database Schema

### Core Tables

1. **users** - User accounts and authentication
2. **applications** - Passport applications
3. **documents** - Uploaded document records
4. **token_records** - Application token assignments
5. **photo_sign_validations** - Photo and signature validation
6. **verification_records** - Document verification status
7. **processing_records** - Police and reference verification
8. **approval_logs** - Final approval decisions
9. **audit_logs** - System audit trail
10. **admin_logs** - Admin activity logs

### Sample Data Included

- ✅ 10 User accounts (6 officers + 4 applicants)
- ✅ 10 Passport applications in various stages
- ✅ 10+ Document records
- ✅ 4 Token assignments
- ✅ 3 Photo/signature validations
- ✅ 3 Verification records
- ✅ 3 Processing records
- ✅ 2 Approval logs
- ✅ Audit trail entries

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
```

### Applications
```
GET    /api/applications           - Get all applications
POST   /api/applications           - Create new application
GET    /api/applications/:id       - Get application by ID
PUT    /api/applications/:id       - Update application
```

### Tokens
```
GET    /api/tokens                 - Get all tokens
POST   /api/tokens                 - Generate token
```

### Documents
```
POST   /api/documents/upload       - Upload document
GET    /api/documents/application/:id - Get documents by application
```

## 🎨 UI Features

- Modern gradient backgrounds
- Responsive design (mobile-friendly)
- Role-based dashboard views
- Interactive statistics cards
- Real-time application tracking
- Color-coded status indicators
- Smooth animations and transitions
- Clean table layouts
- Icon-based navigation

## 📈 Workflow Process

```
1. User Registration & Login
   ↓
2. Submit Application (User)
   ↓
3. Token Generation (Token Officer)
   ↓
4. Photo/Signature Validation (Photo Validator)
   ↓
5. Document Verification (Verification Officer)
   ↓
6. Police & Reference Check (Processing Officer)
   ↓
7. Final Approval (Approval Officer)
   ↓
8. Passport Issued
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=passport_verification_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Passport Verification System
```

## 📝 Adding New Data

### Add New User via API

```javascript
POST /api/auth/register
{
  "username": "new_user",
  "email": "user@example.com",
  "password": "password123",
  "full_name": "New User Name",
  "phone": "9876543210",
  "role": "user"
}
```

### Add New Application via API

```javascript
POST /api/applications
{
  "applicant_type": "new",
  "full_name": "John Doe",
  "date_of_birth": "1990-01-01",
  "gender": "Male",
  "email": "john@example.com",
  "phone": "9876543210",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart

# Check if database exists
psql -U postgres -l
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Errors
- Ensure backend CORS is enabled
- Check API URL in frontend .env file
- Verify both servers are running

## 🚀 Deployment

### Backend (Node.js)
- Use PM2 for process management
- Configure nginx as reverse proxy
- Use environment-specific .env files

### Frontend (React)
```bash
npm run build
# Deploy build folder to static hosting
```

### Database
- Use PostgreSQL managed service (AWS RDS, DigitalOcean)
- Enable SSL connections
- Regular backups

## 📄 License

This project is created for educational and demonstration purposes.

## 👥 Contributors

Developed as a comprehensive passport verification system prototype.

## 📞 Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

**Note**: This is a prototype system. For production use, additional security measures, testing, and compliance with government regulations are required.