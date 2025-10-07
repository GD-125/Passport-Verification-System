// ==========================================
// FILE: backend/controllers/adminController.js
// Admin Controller - User Management & Reports
// ==========================================

const bcrypt = require('bcryptjs');
const { User, Application, AdminLog, AuditLog } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, role } = req.body;

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password_hash,
      full_name,
      phone,
      role,
      status: 'active'
    });

    // Log admin action
    await AdminLog.create({
      admin_id: req.user.id,
      action_type: 'user_created',
      target_user_id: user.id,
      description: `Created user: ${username}`
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, role, status } = req.body;

    const user = await User.update(id, { full_name, phone, role, status });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log admin action
    await AdminLog.create({
      admin_id: req.user.id,
      action_type: 'user_updated',
      target_user_id: id,
      description: `Updated user: ${user.username}`
    });

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// ✅ ADD THIS MISSING FUNCTION
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete the user
    await User.delete(id);

    // Log admin action
    await AdminLog.create({
      admin_id: req.user.id,
      action_type: 'user_deleted',
      target_user_id: id,
      description: `Deleted user: ${user.username}`
    });

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const generateReport = async (req, res) => {
  try {
    const { report_type, start_date, end_date } = req.query;

    let reportData = {};

    switch (report_type) {
      case 'applications':
        reportData = await Application.getReportByDateRange(start_date, end_date);
        break;
      
      case 'users':
        reportData = await User.getUserReport();
        break;
      
      case 'summary':
        const appStats = await Application.getStats();
        const usersByRole = await User.countByRole();
        reportData = {
          applications: appStats,
          users: usersByRole,
          generated_at: new Date().toISOString()
        };
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    res.json({
      report_type,
      start_date,
      end_date,
      data: reportData
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

const getStatistics = async (req, res) => {
  try {
    // Get application statistics
    const appStats = await Application.getStats();

    // Get user count by role
    const usersByRole = await User.countByRole();

    res.json({
      statistics: appStats,
      usersByRole
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { limit, offset, user_id, action, table_name } = req.query;

    const filters = {
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    };

    if (user_id) filters.user_id = user_id;
    if (action) filters.action = action;
    if (table_name) filters.table_name = table_name;

    const auditLogs = await AuditLog.findAll(filters);

    res.json({ auditLogs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

const getAdminLogs = async (req, res) => {
  try {
    const adminLogs = await AdminLog.findAll();
    res.json({ adminLogs });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,        
  getStatistics,
  getAuditLogs,
  getAdminLogs,
  generateReport     
};