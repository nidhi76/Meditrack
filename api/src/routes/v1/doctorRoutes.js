const express = require('express');
const pool = require('../../config/database');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// @desc    Get doctor profile
// @route   GET /api/v1/doctors/profile
// @access  Private (Doctor only)
router.get('/profile', protect, authorize('doctor'), async (req, res) => {
  try {
    const { email } = req.user;

    const [doctors] = await pool.execute(`
      SELECT 
        email,
        first_name,
        last_name,
        gender,
        specialization,
        license_number,
        phone,
        created_at
      FROM doctors 
      WHERE email = ?
    `, [email]);

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctors[0]
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctor profile'
    });
  }
});

// @desc    Update doctor profile
// @route   PUT /api/v1/doctors/profile
// @access  Private (Doctor only)
router.put('/profile', protect, authorize('doctor'), async (req, res) => {
  try {
    const { email } = req.user;
    const { firstName, lastName, specialization, phone } = req.body;

    await pool.execute(`
      UPDATE doctors 
      SET first_name = ?, last_name = ?, specialization = ?, phone = ?, updated_at = NOW()
      WHERE email = ?
    `, [firstName, lastName, specialization, phone, email]);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Get all doctors
// @route   GET /api/v1/doctors
// @access  Public (for appointment booking)
router.get('/', async (req, res) => {
  try {
    const [doctors] = await pool.execute(`
      SELECT 
        email,
        first_name,
        last_name,
        gender,
        specialization,
        phone
      FROM doctors 
      ORDER BY specialization, first_name, last_name
    `);

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctors'
    });
  }
});

// @desc    Add diagnosis to appointment
// @route   POST /api/v1/doctors/diagnose/:appointmentId
// @access  Private (Doctor only)
router.post('/diagnose/:appointmentId', protect, authorize('doctor'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { email: doctorEmail } = req.user;
    const { diagnosis, prescription, doctorNotes } = req.body;

    // Check if appointment exists and belongs to this doctor
    const [appointments] = await pool.execute(
      'SELECT * FROM appointments WHERE id = ? AND doctor_email = ?',
      [appointmentId, doctorEmail]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update diagnosis
    await pool.execute(`
      UPDATE diagnoses 
      SET diagnosis = ?, prescription = ?, doctor_notes = ?, updated_at = NOW()
      WHERE appointment_id = ? AND doctor_email = ?
    `, [diagnosis, prescription, doctorNotes || '', appointmentId, doctorEmail]);

    // Update appointment status
    await pool.execute(
      'UPDATE appointments SET status = "completed", updated_at = NOW() WHERE id = ?',
      [appointmentId]
    );

    res.json({
      success: true,
      message: 'Diagnosis added successfully'
    });
  } catch (error) {
    console.error('Add diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding diagnosis'
    });
  }
});

module.exports = router;

