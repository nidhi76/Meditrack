const express = require('express');
const pool = require('../../config/database');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// @desc    Get patient profile
// @route   GET /api/v1/patients/profile
// @access  Private (Patient only)
router.get('/profile', protect, authorize('patient'), async (req, res) => {
  try {
    const { email } = req.user;

    const [patients] = await pool.execute(`
      SELECT 
        email,
        first_name,
        last_name,
        address,
        gender,
        phone,
        date_of_birth,
        created_at
      FROM patients 
      WHERE email = ?
    `, [email]);

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patients[0]
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient profile'
    });
  }
});

// @desc    Update patient profile
// @route   PUT /api/v1/patients/profile
// @access  Private (Patient only)
router.put('/profile', protect, authorize('patient'), async (req, res) => {
  try {
    const { email } = req.user;
    const { firstName, lastName, address, phone, dateOfBirth } = req.body;

    await pool.execute(`
      UPDATE patients 
      SET first_name = ?, last_name = ?, address = ?, phone = ?, date_of_birth = ?, updated_at = NOW()
      WHERE email = ?
    `, [firstName, lastName, address, phone, dateOfBirth, email]);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Get all patients (for doctors)
// @route   GET /api/v1/patients
// @access  Private (Doctor only)
router.get('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const { email: doctorEmail } = req.user;

    // Get patients who have appointments with this doctor
    const [patients] = await pool.execute(`
      SELECT DISTINCT
        p.email,
        p.first_name,
        p.last_name,
        p.gender,
        p.phone,
        p.date_of_birth
      FROM patients p
      JOIN appointments a ON p.email = a.patient_email
      WHERE a.doctor_email = ?
      ORDER BY p.first_name, p.last_name
    `, [doctorEmail]);

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patients'
    });
  }
});

module.exports = router;

