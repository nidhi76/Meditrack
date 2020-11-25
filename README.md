# Meditrack - Hospital Management System

**Student:** Nidhi Wagh  
**MIS:** 111803106  
**Class:** TY COMP Division 1  
**Course:** Database Management Systems (DBMS)  
**Academic Year:** 2020-2021

## Project Overview

Meditrack is a hospital management system that helps manage patient appointments, doctor schedules, and medical records. This project shows how databases can make hospital operations easier.

## Key Features

### For Patients

- **Login System** - Patients can create accounts and log in
- **Book Appointments** - Patients can book appointments with doctors
- **Medical History** - Patients can view and update their medical records
- **Appointment Management** - Patients can see, change, or cancel appointments

### For Doctors

- **Doctor Login** - Doctors have their own login system
- **Patient Management** - Doctors can see patient information and medical history
- **Appointment Management** - Doctors can see their appointment schedule
- **Diagnosis System** - Doctors can give diagnoses and prescriptions

## Technologies Used

- **Frontend:** React.js
- **Backend:** Node.js, Express
- **Database:** MySQL

## Database Design

The system uses a MySQL database with the following main tables:

```mermaid
erDiagram
    PATIENTS {
        varchar email PK
        varchar password
        varchar first_name
        varchar last_name
        text address
        enum gender
        varchar phone
        date date_of_birth
        timestamp created_at
        timestamp updated_at
    }

    DOCTORS {
        varchar email PK
        varchar password
        varchar first_name
        varchar last_name
        enum gender
        varchar specialization
        varchar license_number
        varchar phone
        timestamp created_at
        timestamp updated_at
    }

    MEDICAL_HISTORY {
        int id PK
        varchar patient_email FK
        text conditions
        text surgeries
        text medications
        text allergies
        timestamp created_at
        timestamp updated_at
    }

    APPOINTMENTS {
        int id PK
        varchar patient_email FK
        varchar doctor_email FK
        date appointment_date
        time start_time
        time end_time
        varchar concerns
        varchar symptoms
        text patient_notes
        enum status
        timestamp created_at
        timestamp updated_at
    }

    DIAGNOSES {
        int id PK
        int appointment_id FK
        varchar doctor_email FK
        text diagnosis
        text prescription
        text doctor_notes
        timestamp created_at
        timestamp updated_at
    }

    DOCTOR_SCHEDULES {
        int id PK
        varchar doctor_email FK
        enum day_of_week
        time start_time
        time end_time
        time break_start_time
        time break_end_time
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PATIENTS ||--o{ APPOINTMENTS : "books"
    DOCTORS ||--o{ APPOINTMENTS : "attends"
    PATIENTS ||--|| MEDICAL_HISTORY : "has"
    APPOINTMENTS ||--|| DIAGNOSES : "receives"
    DOCTORS ||--o{ DIAGNOSES : "provides"
    DOCTORS ||--o{ DOCTOR_SCHEDULES : "follows"
```

## Screenshots

### Patient Interface

![Login Interface](Screenshots/01_Login_Page.png)
_Patient login page_

![Patient Dashboard](Screenshots/02_Dashboard_Patient_Home.png)
_Patient home screen_

![Appointment Booking](Screenshots/03_Appointment_Booking_Form.png)
_Book appointment form_

![Appointment Management](Screenshots/04_Appointment.png)
_View appointments_

![Medical Records](Screenshots/05_Medical_History_Form.png)
_Medical history form_

### Doctor Interface

![Doctor Dashboard](Screenshots/06_Dashboard_Doctor_Home.png)
_Doctor home screen_

![Appointment Overview](Screenshots/07_Appointment_List_Doctor_View.png)
_Doctor appointment list_

![Patient Profile](Screenshots/08_Patient_Profile_Doctor_View.png)
_Doctor viewing patient profile_

## How to Run

1. **Install Dependencies**

   ```bash
   cd api
   npm install

   cd web
   npm install
   ```

2. **Start the Application**

   ```bash
   # Start backend
   cd api
   npm start

   # Start frontend
   cd web
   npm start
   ```

3. **Access the Application**
   - Open your browser and go to `http://localhost:3000`

## Login Credentials

### Doctors

- Email: `dr.smith@meditrack.com` | Password: `password123`
- Email: `dr.johnson@meditrack.com` | Password: `password123`
- Email: `nidhi.wagh@meditrack.com` | Password: `password123`

### Patients

- Email: `nidhi.wagh@example.com` | Password: `password123`
- Email: `patient1@example.com` | Password: `password123`

---

**Project Information:**

- **Developer:** Nidhi Wagh (MIS: 111803106)
- **Institution:** TY COMP Division 1
- **Course:** Database Management Systems (DBMS)
- **Project Period:** November 2020
- **Academic Year:** 2020-2021
