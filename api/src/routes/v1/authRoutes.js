const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');
const { protect } = require('../../middleware/authMiddleware');
const { validateRequest, schemas } = require('../../middleware/validationMiddleware');

const router = express.Router();

// Generate JWT Token
const generateToken = (email, userType) => {
  return jwt.sign(
    { email, userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register patient
// @route   POST /api/v1/auth/register/patient
// @access  Public
router.post('/register/patient', validateRequest(schemas.patientRegistration), async (req, res) => {
  try {
    const { firstName, lastName, email, password, address, gender, phone, dateOfBirth } = req.body;

    // Check if patient already exists
    const [existingPatient] = await pool.execute(
      'SELECT email FROM patients WHERE email = ?',
      [email]
    );

    if (existingPatient.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create patient
    const [result] = await pool.execute(
      `INSERT INTO patients (email, password, first_name, last_name, address, gender, phone, date_of_birth, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [email, hashedPassword, firstName, lastName, address, gender, phone, dateOfBirth]
    );

    // Create medical history entry
    const [historyResult] = await pool.execute(
      `INSERT INTO medical_history (patient_email, conditions, surgeries, medications, allergies, created_at) 
       VALUES (?, 'None', 'None', 'None', 'None', NOW())`,
      [email]
    );

    // Generate token
    const token = generateToken(email, 'patient');

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        token,
        user: {
          email,
          name: `${firstName} ${lastName}`,
          userType: 'patient'
        }
      }
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during patient registration'
    });
  }
});

// @desc    Register doctor
// @route   POST /api/v1/auth/register/doctor
// @access  Public
router.post('/register/doctor', validateRequest(schemas.doctorRegistration), async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, specialization, licenseNumber, phone } = req.body;

    // Check if doctor already exists
    const [existingDoctor] = await pool.execute(
      'SELECT email FROM doctors WHERE email = ?',
      [email]
    );

    if (existingDoctor.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create doctor
    const [result] = await pool.execute(
      `INSERT INTO doctors (email, password, first_name, last_name, gender, specialization, license_number, phone, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [email, hashedPassword, firstName, lastName, gender, specialization, licenseNumber, phone]
    );

    // Generate token
    const token = generateToken(email, 'doctor');

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      data: {
        token,
        user: {
          email,
          name: `${firstName} ${lastName}`,
          userType: 'doctor'
        }
      }
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during doctor registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check patient first
    let [users] = await pool.execute(
      'SELECT email, password, first_name, last_name, "patient" as user_type FROM patients WHERE email = ?',
      [email]
    );

    // If not found in patients, check doctors
    if (users.length === 0) {
      [users] = await pool.execute(
        'SELECT email, password, first_name, last_name, "doctor" as user_type FROM doctors WHERE email = ?',
        [email]
      );
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.email, user.user_type);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          userType: user.user_type
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const { email, user_type } = req.user;

    let user;
    if (user_type === 'patient') {
      const [patients] = await pool.execute(
        'SELECT email, first_name, last_name, address, gender, phone, date_of_birth FROM patients WHERE email = ?',
        [email]
      );
      user = patients[0];
    } else {
      const [doctors] = await pool.execute(
        'SELECT email, first_name, last_name, gender, specialization, license_number, phone FROM doctors WHERE email = ?',
        [email]
      );
      user = doctors[0];
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          name: `${user.first_name} ${user.last_name}`,
          userType: user_type
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password
// @access  Private
router.put('/reset-password', protect, validateRequest(schemas.passwordReset), async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { email, user_type } = req.user;

    // Get current password
    const table = user_type === 'patient' ? 'patients' : 'doctors';
    const [users] = await pool.execute(
      `SELECT password FROM ${table} WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, users[0].password);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.execute(
      `UPDATE ${table} SET password = ? WHERE email = ?`,
      [hashedNewPassword, email]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;

