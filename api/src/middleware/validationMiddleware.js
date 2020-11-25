const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  // Patient registration
  patientRegistration: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    address: Joi.string().min(5).max(200).required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    dateOfBirth: Joi.date().max('now').optional()
  }),

  // Doctor registration
  doctorRegistration: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    specialization: Joi.string().min(2).max(100).required(),
    licenseNumber: Joi.string().min(5).max(20).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional()
  }),

  // Login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Appointment booking
  appointmentBooking: Joi.object({
    doctorId: Joi.string().email().required(),
    appointmentDate: Joi.date().min('now').required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    concerns: Joi.string().max(200).required(),
    symptoms: Joi.string().max(200).required(),
    patientNotes: Joi.string().max(500).optional()
  }),

  // Medical history
  medicalHistory: Joi.object({
    conditions: Joi.string().max(200).optional(),
    surgeries: Joi.string().max(200).optional(),
    medications: Joi.string().max(200).optional(),
    allergies: Joi.string().max(200).optional()
  }),

  // Diagnosis
  diagnosis: Joi.object({
    diagnosis: Joi.string().min(5).max(200).required(),
    prescription: Joi.string().min(5).max(200).required(),
    notes: Joi.string().max(500).optional()
  }),

  // Password reset
  passwordReset: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
};

module.exports = { validateRequest, schemas };

