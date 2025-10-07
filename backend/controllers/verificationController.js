// ==========================================
// FILE: backend/controllers/verificationController.js
// Document Verification Controller
// ==========================================

const { Verification, Application, Document } = require('../models');

const createVerification = async (req, res) => {
  try {
    const { application_id } = req.body;

    const verification = await Verification.create(application_id);

    res.status(201).json({
      message: 'Verification record created',
      record: verification
    });
  } catch (error) {
    console.error('Create verification error:', error);
    res.status(500).json({ error: 'Failed to create verification record' });
  }
};

const getPendingVerifications = async (req, res) => {
  try {
    const verifications = await Verification.findPending();

    res.json({ verifications });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
};

const getVerificationByAppId = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const verification = await Verification.findByApplicationId(applicationId);

    if (!verification) {
      return res.status(404).json({ error: 'Verification record not found' });
    }

    res.json({ verification });
  } catch (error) {
    console.error('Get verification error:', error);
    res.status(500).json({ error: 'Failed to fetch verification' });
  }
};

const updateVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const verificationData = {
      ...req.body,
      verified_by: req.user.id
    };

    const verification = await Verification.update(id, verificationData);

    if (!verification) {
      return res.status(404).json({ error: 'Verification record not found' });
    }

    // Update application stage if completed
    if (verificationData.verification_status === 'completed') {
      await Application.updateStage(verification.application_id, 'police_verification');
    }

    res.json({
      message: 'Verification updated successfully',
      verification
    });
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({ error: 'Failed to update verification' });
  }
};

const verifyDocument = async (req, res) => {
  try {
    const { applicationId, documentType } = req.params;
    const { verified, remarks } = req.body;

    const document = await Document.verify(
      applicationId,
      req.user.id,
      verified,
      remarks
    );

    res.json({
      message: 'Document verified successfully',
      document
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
};

module.exports = {
  createVerification,
  getPendingVerifications,
  getVerificationByAppId,
  updateVerification,
  verifyDocument
};
