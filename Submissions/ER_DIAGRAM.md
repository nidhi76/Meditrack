# Meditrack System - Entity Relationship Diagram

**Student:** Nidhi Wagh  
**MIS:** 111803106  
**Course:** Database Management Systems (DBMS)  
**Project:** Hospital Management System  
**Academic Year:** 2020-2021

## Visual ER Diagram

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

## ER Diagram Description

### Entities and Attributes

#### 1. PATIENT

**Attributes:**

- email (PK)
- password
- first_name
- last_name
- address
- gender
- phone
- date_of_birth
- created_at
- updated_at

#### 2. DOCTOR

**Attributes:**

- email (PK)
- password
- first_name
- last_name
- gender
- specialization
- license_number
- phone
- created_at
- updated_at

#### 3. APPOINTMENT

**Attributes:**

- id (PK)
- patient_email (FK)
- doctor_email (FK)
- appointment_date
- start_time
- end_time
- concerns
- symptoms
- patient_notes
- status
- created_at
- updated_at

#### 4. MEDICAL_HISTORY

**Attributes:**

- id (PK)
- patient_email (FK)
- conditions
- surgeries
- medications
- allergies
- created_at
- updated_at

#### 5. DIAGNOSIS

**Attributes:**

- id (PK)
- appointment_id (FK)
- doctor_email (FK)
- diagnosis
- prescription
- doctor_notes
- created_at
- updated_at

#### 6. DOCTOR_SCHEDULE

**Attributes:**

- id (PK)
- doctor_email (FK)
- day_of_week
- start_time
- end_time
- break_start_time
- break_end_time
- is_active
- created_at
- updated_at

---

## Relationships

### 1. PATIENT — APPOINTMENT

- **Type**: One-to-Many
- **Description**: One patient can have multiple appointments
- **Cardinality**: 1:N
- **Foreign Key**: appointment.patient_email → patient.email

### 2. DOCTOR — APPOINTMENT

- **Type**: One-to-Many
- **Description**: One doctor can have multiple appointments
- **Cardinality**: 1:N
- **Foreign Key**: appointment.doctor_email → doctor.email

### 3. PATIENT — MEDICAL_HISTORY

- **Type**: One-to-One
- **Description**: Each patient has one medical history record
- **Cardinality**: 1:1
- **Foreign Key**: medical_history.patient_email → patient.email

### 4. APPOINTMENT — DIAGNOSIS

- **Type**: One-to-One
- **Description**: Each appointment has one diagnosis record
- **Cardinality**: 1:1
- **Foreign Key**: diagnosis.appointment_id → appointment.id

### 5. DOCTOR — DIAGNOSIS

- **Type**: One-to-Many
- **Description**: One doctor can provide multiple diagnoses
- **Cardinality**: 1:N
- **Foreign Key**: diagnosis.doctor_email → doctor.email

### 6. DOCTOR — DOCTOR_SCHEDULE

- **Type**: One-to-Many
- **Description**: One doctor has multiple schedule entries (one per day)
- **Cardinality**: 1:N
- **Foreign Key**: doctor_schedule.doctor_email → doctor.email

---

## ER Diagram (Textual Representation)

```
┌─────────────┐
│   PATIENT   │
├─────────────┤
│ email (PK)  │
│ password    │
│ first_name  │
│ last_name   │
│ address     │
│ gender      │
│ phone       │
└─────────────┘
       │
       │ 1
       │
       │ has
       │
       │ N
       ▼
┌─────────────────┐
│  MEDICAL_HISTORY│
├─────────────────┤
│ id (PK)         │
│ patient_email(FK)│
│ conditions      │
│ surgeries       │
│ medications     │
│ allergies       │
└─────────────────┘


┌─────────────┐                    ┌──────────────┐
│   PATIENT   │────────────────────│ APPOINTMENT  │
└─────────────┘  books         1:N ├──────────────┤
                                    │ id (PK)      │
                                    │ patient_email│
┌─────────────┐                    │ doctor_email │
│   DOCTOR    │────────────────────│ date         │
└─────────────┘  attends       1:N │ start_time   │
                                    │ end_time     │
                                    │ concerns     │
                                    │ symptoms     │
                                    │ patient_notes│
                                    │ status       │
                                    └──────────────┘
                                           │
                                           │ 1
                                           │
                                           │ has
                                           │
                                           │ 1
                                           ▼
                                    ┌──────────────┐
                                    │  DIAGNOSIS   │
                                    ├──────────────┤
                                    │ id (PK)      │
                                    │ appt_id (FK) │
                                    │ doctor_email │
                                    │ diagnosis    │
                                    │ prescription │
                                    │ doctor_notes │
                                    └──────────────┘
```
