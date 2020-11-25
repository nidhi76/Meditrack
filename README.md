# Hospital Management System - DBMS Project

**Name:** Nidhi Wagh  
**MIS:** 111803106  
**Class:** TY Comp Div 2  
**Course:** Database Management Systems (DBMS) - Sem 5 Project

Hospital Management System made for Sem 5 DBMS Course Project.

Hospitals interact with a lot of people in a day and there are various activities involved in day to day operations of hospitals, for example booking of appointments, managing doctor schedules, managing patient diagnoses, managing medical histories of patients, etc. The aim of this project is to show how data related to these tasks can be made easier to manage using databases.

## Technologies Used

- **Frontend:** React.js
- **Backend:** Node.js, Express
- **Database:** MySQL

## ER Diagram

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

## Patient Side Features

1. There is a separate interface for patients. Patients have a separate login.
2. Patients can book appointments.
3. Patients can give previous medical history.
4. Patients can view/update/cancel already booked appointments if necessary.
5. Cancelled appointments create free slots for other patients.
6. The system avoids clash of appointments with other patients. Each patient is therefore ensured his/her slot.
7. Patients are able to see complete diagnosis, prescriptions and medical history.
8. Patient medical history is only available to the doctor with whom the appointment is booked to ensure privacy.

## Doctor Side Features

1. There is a separate interface for doctors. Doctors have a separate login.
2. The system takes into consideration doctor schedules and does not allow appointments when a doctor is already busy or has a break.
3. Doctors are able to access patient history and profile, and add to patient history.
4. Doctors are able to give diagnosis and prescriptions.
5. Doctors are able to modify diagnosis and prescriptions.

## Screenshots

### Patient Interface

![Login Page](Submissions/Screenshots/01_Login_Page.png)
_Patient Login Screen_

![Patient Dashboard](Submissions/Screenshots/02_Dashboard_Patient_Home.png)
_Patient Home Screen_

![Appointment Booking](Submissions/Screenshots/03_Appointment_Booking_Form.png)
_Patient Scheduling Appointment_

![Appointment Details](Submissions/Screenshots/04_Appointment.png)
_Patient Viewing Appointments_

![Medical History](Submissions/Screenshots/05_Medical_History_Form.png)
_Patient Viewing History_

### Doctor Interface

![Doctor Dashboard](Submissions/Screenshots/06_Dashboard_Doctor_Home.png)
_Doctor Home Screen_

![Appointment List](Submissions/Screenshots/07_Appointment_List_Doctor_View.png)
_Doctor Viewing Appointment_

![Patient Profile](Submissions/Screenshots/08_Patient_Profile_Doctor_View.png)
_Doctor Viewing Patient History_

## Instructions to Run

1. Run `npm install` in both `api` and `web` directories.
2. Run `npm start` first in the `api` directory and then in the `web` directory.
3. Access `localhost:3000` from the browser.

## Default Login Credentials

### Doctors:

- Email: `dr.smith@meditrack.com` | Password: `password123`
- Email: `dr.johnson@meditrack.com` | Password: `password123`
- Email: `nidhi.wagh@meditrack.com` | Password: `password123`

### Patients:

- Email: `nidhi.wagh@example.com` | Password: `password123`
- Email: `patient1@example.com` | Password: `password123`
