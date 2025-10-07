// ==========================================
// FILE: backend/controllers/applicationController.js
// ==========================================

const { Application, AuditLog } = require('../models');

const createApplication = async (req, res) => {
  try {
    const applicationData = {
      user_id: req.user.id,
      applicant_type: req.body.applicant_type,
      full_name: req.body.full_name,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode
    };

    // Create application using model
    const application = await Application.create(applicationData);

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'INSERT',
      table_name: 'applications',
      record_id: application.id,
      changes: JSON.stringify(application),
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(201).json({
      message: 'Application created successfully',
      application
    });
  } catch (error) {
    console.error('Application creation error:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

const getApplications = async (req, res) => {
  try {
    let applications;

    // Filter by user role
    if (req.user.role === 'user') {
      applications = await Application.findAll({ user_id: req.user.id });
    } else {
      applications = await Application.findAllWithUser();
    }

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, current_stage, remarks } = req.body;

    const application = await Application.updateStatus(id, {
      status,
      current_stage,
      remarks
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Log the update
    await AuditLog.create({
      user_id: req.user.id,
      action: 'UPDATE',
      table_name: 'applications',
      record_id: id,
      changes: JSON.stringify({ status, current_stage, remarks }),
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus
};
