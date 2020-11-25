const express = require('express');
const pool = require('../../config/database');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { validateRequest, schemas } = require('../../middleware/validationMiddleware');

const router = express.Router();

// @desc    Get medical history for current patient
// @route   GET /api/v1/medical-history
// @access  Private (Patient only)
router.get('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { email } = req.user;

    const [history] = await pool.execute(`
      SELECT 
        id,
        conditions,
        surgeries,
        medications,
        allergies,
        created_at,
        updated_at
      FROM medical_history 
      WHERE patient_email = ?
      ORDER BY created_at DESC
    `, [email]);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medical history'
    });
  }
});

// @desc    Update medical history
// @route   PUT /api/v1/medical-history
// @access  Private (Patient only)
router.put('/', protect, authorize('patient'), validateRequest(schemas.medicalHistory), async (req, res) => {
  try {
    const { email } = req.user;
    const { conditions, surgeries, medications, allergies } = req.body;

    // Check if medical history exists
    const [existingHistory] = await pool.execute(
      'SELECT id FROM medical_history WHERE patient_email = ?',
      [email]
    );

    if (existingHistory.length === 0) {
      // Create new medical history
      await pool.execute(`
        INSERT INTO medical_history (patient_email, conditions, surgeries, medications, allergies, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [email, conditions || 'None', surgeries || 'None', medications || 'None', allergies || 'None']);
    } else {
      // Update existing medical history
      await pool.execute(`
        UPDATE medical_history 
        SET conditions = ?, surgeries = ?, medications = ?, allergies = ?, updated_at = NOW()
        WHERE patient_email = ?
      `, [conditions || 'None', surgeries || 'None', medications || 'None', allergies || 'None', email]);
    }

    res.json({
      success: true,
      message: 'Medical history updated successfully'
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating medical history'
    });
  }
});

// @desc    Get patient medical history (for doctors)
// @route   GET /api/v1/medical-history/patient/:patientEmail
// @access  Private (Doctor only)
router.get('/patient/:patientEmail', protect, authorize('doctor'), async (req, res) => {
  try {
    const { patientEmail } = req.params;
    const { email: doctorEmail } = req.user;

    // Check if doctor has appointments with this patient
    const [hasAccess] = await pool.execute(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE patient_email = ? AND doctor_email = ?
    `, [patientEmail, doctorEmail]);

    if (hasAccess[0].count === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have appointments with this patient.'
      });
    }

    const [history] = await pool.execute(`
      SELECT 
        mh.conditions,
        mh.surgeries,
        mh.medications,
        mh.allergies,
        mh.created_at,
        mh.updated_at
      FROM medical_history mh
      WHERE mh.patient_email = ?
    `, [patientEmail]);

    // Get patient info
    const [patient] = await pool.execute(`
      SELECT first_name, last_name, gender, date_of_birth
      FROM patients 
      WHERE email = ?
    `, [patientEmail]);

    res.json({
      success: true,
      data: {
        patient: patient[0],
        medicalHistory: history[0] || null
      }
    });
  } catch (error) {
    console.error('Get patient medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient medical history'
    });
  }
});

module.exports = router;

