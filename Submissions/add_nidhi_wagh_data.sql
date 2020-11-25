-- =====================================================
-- MEDITRACK SYSTEM - COMPLETE SETUP FOR SCREENSHOTS
-- Student: Nidhi Wagh
-- Course: Database Management Systems (DBMS)
-- =====================================================

-- This single file contains:
-- 1. Database setup with Nidhi Wagh's data
-- 2. Screenshot instructions
-- 3. Login credentials
-- 4. Complete setup guide

USE meditrack_db;

-- Add Nidhi Wagh as a Doctor
INSERT INTO doctors (email, password, first_name, last_name, gender, specialization, license_number, phone) VALUES
('nidhi.wagh@meditrack.com', '$2a$12$BtN.osZCCo4JvTpFU607EuWvXERlV0yTK5xkBp4bwOkUGd507N52i', 'Nidhi', 'Wagh', 'female', 'General Medicine', 'GEN001', '555-0201');

-- Add Nidhi Wagh as a Patient (Age 20)
INSERT INTO patients (email, password, first_name, last_name, address, gender, phone, date_of_birth) VALUES
('nidhi.wagh@example.com', '$2a$12$BtN.osZCCo4JvTpFU607EuWvXERlV0yTK5xkBp4bwOkUGd507N52i', 'Nidhi', 'Wagh', '123 College Street, University Area, City', 'female', '555-0202', '2005-01-15');

-- Add Medical History for Nidhi Wagh (Patient)
INSERT INTO medical_history (patient_email, conditions, surgeries, medications, allergies) VALUES
('nidhi.wagh@example.com', 'None currently', 'None', 'None', 'None known');

-- Add Doctor Schedule for Nidhi Wagh (Doctor)
INSERT INTO doctor_schedules (doctor_email, day_of_week, start_time, end_time, break_start_time, break_end_time) VALUES
('nidhi.wagh@meditrack.com', 'monday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('nidhi.wagh@meditrack.com', 'tuesday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('nidhi.wagh@meditrack.com', 'wednesday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('nidhi.wagh@meditrack.com', 'thursday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('nidhi.wagh@meditrack.com', 'friday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('nidhi.wagh@meditrack.com', 'saturday', '10:00:00', '14:00:00', '12:00:00', '12:30:00');

-- Add some sample appointments for Nidhi Wagh (Patient) - November 2020 dates
INSERT INTO appointments (patient_email, doctor_email, appointment_date, start_time, end_time, concerns, symptoms, patient_notes, status) VALUES
('nidhi.wagh@example.com', 'dr.smith@meditrack.com', '2020-11-15', '11:00:00', '11:30:00', 'Regular health checkup', 'No specific symptoms', 'Annual health checkup. Please review my overall health status.', 'scheduled'),
('nidhi.wagh@example.com', 'nidhi.wagh@meditrack.com', '2020-11-18', '14:00:00', '14:30:00', 'Consultation about project', 'No medical symptoms', 'This is for my college project demonstration. Need to show doctor-patient interaction.', 'scheduled');

-- Add a completed appointment for demonstration - November 2020
INSERT INTO appointments (patient_email, doctor_email, appointment_date, start_time, end_time, concerns, symptoms, patient_notes, status) VALUES
('nidhi.wagh@example.com', 'dr.johnson@meditrack.com', '2020-11-10', '10:00:00', '10:30:00', 'General consultation', 'Mild headache', 'Had some stress-related headaches during exam period.', 'completed');

-- Add diagnosis for the completed appointment
INSERT INTO diagnoses (appointment_id, doctor_email, diagnosis, prescription, doctor_notes) VALUES
((SELECT id FROM appointments WHERE patient_email = 'nidhi.wagh@example.com' AND doctor_email = 'dr.johnson@meditrack.com' AND status = 'completed' LIMIT 1), 'dr.johnson@meditrack.com', 'Stress-related tension headache', 'Rest, adequate sleep, stress management techniques. Take paracetamol 500mg if needed (max 3 times daily).', 'Patient is a college student. Advised to maintain regular sleep schedule and practice relaxation techniques during exam periods.');

-- Show the added data
SELECT 'Nidhi Wagh as Doctor' as info, email, first_name, last_name, specialization FROM doctors WHERE email = 'nidhi.wagh@meditrack.com'
UNION ALL
SELECT 'Nidhi Wagh as Patient' as info, email, first_name, last_name, 'Patient' as specialization FROM patients WHERE email = 'nidhi.wagh@example.com';

-- Show appointments for Nidhi Wagh
SELECT 'Appointments for Nidhi Wagh' as info, COUNT(*) as count FROM appointments WHERE patient_email = 'nidhi.wagh@example.com' OR doctor_email = 'nidhi.wagh@meditrack.com';