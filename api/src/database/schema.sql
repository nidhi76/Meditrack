-- Meditrack System Database Schema
-- Modern Healthcare Management System

CREATE DATABASE IF NOT EXISTS meditrack_db;
USE meditrack_db;

-- Patients table
CREATE TABLE patients (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    phone VARCHAR(15),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medical History table
CREATE TABLE medical_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_email VARCHAR(100) NOT NULL,
    conditions TEXT DEFAULT 'None',
    surgeries TEXT DEFAULT 'None',
    medications TEXT DEFAULT 'None',
    allergies TEXT DEFAULT 'None',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_email) REFERENCES patients(email) ON DELETE CASCADE
);

-- Appointments table (with Patient Notes feature)
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_email VARCHAR(100) NOT NULL,
    doctor_email VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    concerns VARCHAR(200) NOT NULL,
    symptoms VARCHAR(200) NOT NULL,
    patient_notes TEXT, -- NEW FEATURE: Patient Notes/Comments
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_email) REFERENCES patients(email) ON DELETE CASCADE,
    FOREIGN KEY (doctor_email) REFERENCES doctors(email) ON DELETE CASCADE,
    INDEX idx_doctor_date (doctor_email, appointment_date),
    INDEX idx_patient_date (patient_email, appointment_date)
);

-- Diagnoses table
CREATE TABLE diagnoses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    doctor_email VARCHAR(100) NOT NULL,
    diagnosis TEXT NOT NULL,
    prescription TEXT NOT NULL,
    doctor_notes TEXT, -- Additional doctor notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_email) REFERENCES doctors(email) ON DELETE CASCADE,
    UNIQUE KEY unique_appointment_doctor (appointment_id, doctor_email)
);

-- Doctor Schedules table
CREATE TABLE doctor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_email VARCHAR(100) NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME,
    break_end_time TIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_email) REFERENCES doctors(email) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, start_time);
CREATE INDEX idx_medical_history_patient ON medical_history(patient_email);
CREATE INDEX idx_diagnoses_appointment ON diagnoses(appointment_id);
CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_email);

-- Insert sample data
INSERT INTO doctors (email, password, first_name, last_name, gender, specialization, license_number, phone) VALUES
('dr.smith@meditrack.com', '$2a$12$BtN.osZCCo4JvTpFU607EuWvXERlV0yTK5xkBp4bwOkUGd507N52i', 'John', 'Smith', 'male', 'Cardiology', 'CARD001', '555-0101'),
('dr.johnson@meditrack.com', '$2a$12$BtN.osZCCo4JvTpFU607EuWvXERlV0yTK5xkBp4bwOkUGd507N52i', 'Sarah', 'Johnson', 'female', 'Pediatrics', 'PED001', '555-0102'),
('dr.williams@meditrack.com', '$2a$12$BtN.osZCCo4JvTpFU607EuWvXERlV0yTK5xkBp4bwOkUGd507N52i', 'Michael', 'Williams', 'male', 'Orthopedics', 'ORTH001', '555-0103');

INSERT INTO patients (email, password, first_name, last_name, address, gender, phone, date_of_birth) VALUES
('patient1@example.com', '$2a$12$BtN.osZCCo4JvTpFU607EuWvXERlV0yTK5xkBp4bwOkUGd507N52i', 'Alice', 'Brown', '123 Main St, City, State', 'female', '555-1001', '1990-05-15'),
('patient2@example.com', '$2a$12$BtN.osZCCo4JvTpFU607EuWvXERlV0yTK5xkBp4bwOkUGd507N52i', 'Bob', 'Davis', '456 Oak Ave, City, State', 'male', '555-1002', '1985-08-22');

INSERT INTO medical_history (patient_email, conditions, surgeries, medications, allergies) VALUES
('patient1@example.com', 'Hypertension, Diabetes Type 2', 'Appendectomy (2015)', 'Metformin, Lisinopril', 'Penicillin'),
('patient2@example.com', 'Asthma', 'None', 'Albuterol inhaler', 'Shellfish');

INSERT INTO doctor_schedules (doctor_email, day_of_week, start_time, end_time, break_start_time, break_end_time) VALUES
('dr.smith@meditrack.com', 'monday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('dr.smith@meditrack.com', 'tuesday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('dr.smith@meditrack.com', 'wednesday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('dr.smith@meditrack.com', 'thursday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('dr.smith@meditrack.com', 'friday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
('dr.johnson@meditrack.com', 'monday', '08:00:00', '16:00:00', '12:00:00', '13:00:00'),
('dr.johnson@meditrack.com', 'tuesday', '08:00:00', '16:00:00', '12:00:00', '13:00:00'),
('dr.johnson@meditrack.com', 'wednesday', '08:00:00', '16:00:00', '12:00:00', '13:00:00'),
('dr.johnson@meditrack.com', 'thursday', '08:00:00', '16:00:00', '12:00:00', '13:00:00'),
('dr.johnson@meditrack.com', 'friday', '08:00:00', '16:00:00', '12:00:00', '13:00:00'),
('dr.williams@meditrack.com', 'monday', '10:00:00', '18:00:00', '13:00:00', '14:00:00'),
('dr.williams@meditrack.com', 'tuesday', '10:00:00', '18:00:00', '13:00:00', '14:00:00'),
('dr.williams@meditrack.com', 'wednesday', '10:00:00', '18:00:00', '13:00:00', '14:00:00'),
('dr.williams@meditrack.com', 'thursday', '10:00:00', '18:00:00', '13:00:00', '14:00:00'),
('dr.williams@meditrack.com', 'friday', '10:00:00', '18:00:00', '13:00:00', '14:00:00');

