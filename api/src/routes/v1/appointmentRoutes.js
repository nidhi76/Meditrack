const express = require('express');
const pool = require('../../config/database');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { validateRequest, schemas } = require('../../middleware/validationMiddleware');

const router = express.Router();

// @desc    Get all appointments for current user
// @route   GET /api/v1/appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { email, user_type } = req.user;

    let appointments;
    if (user_type === 'patient') {
      // Get appointments for patient
      [appointments] = await pool.execute(`
        SELECT 
          a.id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.status,
          a.patient_notes,
          d.first_name as doctor_first_name,
          d.last_name as doctor_last_name,
          d.specialization,
          di.diagnosis,
          di.prescription,
          di.doctor_notes
        FROM appointments a
        JOIN doctors d ON a.doctor_email = d.email
        LEFT JOIN diagnoses di ON a.id = di.appointment_id
        WHERE a.patient_email = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `, [email]);
    } else {
      // Get appointments for doctor
      [appointments] = await pool.execute(`
        SELECT 
          a.id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.status,
          a.patient_notes,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name,
          p.phone,
          di.diagnosis,
          di.prescription,
          di.doctor_notes
        FROM appointments a
        JOIN patients p ON a.patient_email = p.email
        LEFT JOIN diagnoses di ON a.id = di.appointment_id
        WHERE a.doctor_email = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC
      `, [email]);
    }

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
});

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, user_type } = req.user;

    let appointment;
    if (user_type === 'patient') {
      [appointment] = await pool.execute(`
        SELECT 
          a.*,
          d.first_name as doctor_first_name,
          d.last_name as doctor_last_name,
          d.specialization,
          di.diagnosis,
          di.prescription,
          di.doctor_notes
        FROM appointments a
        JOIN doctors d ON a.doctor_email = d.email
        LEFT JOIN diagnoses di ON a.id = di.appointment_id
        WHERE a.id = ? AND a.patient_email = ?
      `, [id, email]);
    } else {
      [appointment] = await pool.execute(`
        SELECT 
          a.*,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name,
          p.phone,
          di.diagnosis,
          di.prescription,
          di.doctor_notes
        FROM appointments a
        JOIN patients p ON a.patient_email = p.email
        LEFT JOIN diagnoses di ON a.id = di.appointment_id
        WHERE a.id = ? AND a.doctor_email = ?
      `, [id, email]);
    }

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment[0]
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment'
    });
  }
});

// @desc    Book new appointment
// @route   POST /api/v1/appointments
// @access  Private (Patient only)
router.post('/', protect, authorize('patient'), validateRequest(schemas.appointmentBooking), async (req, res) => {
  try {
    const { doctorId, appointmentDate, startTime, endTime, concerns, symptoms, patientNotes } = req.body;
    const { email: patientEmail } = req.user;

    // Check if doctor exists
    const [doctors] = await pool.execute(
      'SELECT email, first_name, last_name FROM doctors WHERE email = ?',
      [doctorId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check for appointment conflicts
    const [conflicts] = await pool.execute(`
      SELECT id FROM appointments 
      WHERE doctor_email = ? 
      AND appointment_date = ? 
      AND status != 'cancelled'
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `, [doctorId, appointmentDate, startTime, startTime, endTime, endTime, startTime, endTime]);

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Check if patient already has appointment at same time
    const [patientConflicts] = await pool.execute(`
      SELECT id FROM appointments 
      WHERE patient_email = ? 
      AND appointment_date = ? 
      AND status != 'cancelled'
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `, [patientEmail, appointmentDate, startTime, startTime, endTime, endTime, startTime, endTime]);

    if (patientConflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment at this time'
      });
    }

    // Create appointment
    const [result] = await pool.execute(`
      INSERT INTO appointments 
      (patient_email, doctor_email, appointment_date, start_time, end_time, concerns, symptoms, patient_notes, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())
    `, [patientEmail, doctorId, appointmentDate, startTime, endTime, concerns, symptoms, patientNotes || '']);

    // Create diagnosis entry
    await pool.execute(`
      INSERT INTO diagnoses (appointment_id, doctor_email, diagnosis, prescription, doctor_notes, created_at) 
      VALUES (?, ?, 'Pending', 'Pending', '', NOW())
    `, [result.insertId, doctorId]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointmentId: result.insertId,
        appointmentDate,
        startTime,
        endTime,
        doctor: doctors[0]
      }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment'
    });
  }
});

// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, user_type } = req.user;
    const { concerns, symptoms, patientNotes } = req.body;

    // Check if appointment exists and user has access
    let appointment;
    if (user_type === 'patient') {
      [appointment] = await pool.execute(
        'SELECT * FROM appointments WHERE id = ? AND patient_email = ? AND status != "completed"',
        [id, email]
      );
    } else {
      [appointment] = await pool.execute(
        'SELECT * FROM appointments WHERE id = ? AND doctor_email = ?',
        [id, email]
      );
    }

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be modified'
      });
    }

    // Update appointment
    if (user_type === 'patient') {
      await pool.execute(
        'UPDATE appointments SET concerns = ?, symptoms = ?, patient_notes = ?, updated_at = NOW() WHERE id = ?',
        [concerns, symptoms, patientNotes, id]
      );
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment'
    });
  }
});

// @desc    Cancel appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, user_type } = req.user;

    // Check if appointment exists and user has access
    let appointment;
    if (user_type === 'patient') {
      [appointment] = await pool.execute(
        'SELECT * FROM appointments WHERE id = ? AND patient_email = ? AND status = "scheduled"',
        [id, email]
      );
    } else {
      [appointment] = await pool.execute(
        'SELECT * FROM appointments WHERE id = ? AND doctor_email = ? AND status = "scheduled"',
        [id, email]
      );
    }

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be cancelled'
      });
    }

    // Cancel appointment
    await pool.execute(
      'UPDATE appointments SET status = "cancelled", updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment'
    });
  }
});

// @desc    Get available time slots for doctor
// @route   GET /api/v1/appointments/available/:doctorEmail/:date
// @access  Private
router.get('/available/:doctorEmail/:date', protect, async (req, res) => {
  try {
    const { doctorEmail, date } = req.params;

    // Get doctor's schedule (assuming 9 AM to 5 PM for simplicity)
    const availableSlots = [];
    const startHour = 9;
    const endHour = 17;

    // Get booked appointments for the date
    const [bookedAppointments] = await pool.execute(`
      SELECT start_time, end_time FROM appointments 
      WHERE doctor_email = ? AND appointment_date = ? AND status != 'cancelled'
    `, [doctorEmail, date]);

    // Generate available slots (1-hour slots)
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`;

      // Check if slot is available
      const isBooked = bookedAppointments.some(appt => {
        const apptStart = appt.start_time;
        const apptEnd = appt.end_time;
        return (startTime >= apptStart && startTime < apptEnd) ||
               (endTime > apptStart && endTime <= apptEnd) ||
               (startTime <= apptStart && endTime >= apptEnd);
      });

      if (!isBooked) {
        availableSlots.push({
          startTime,
          endTime,
          displayTime: `${hour}:00 - ${hour + 1}:00`
        });
      }
    }

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available slots'
    });
  }
});

module.exports = router;

