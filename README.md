# Healthcare AI Interoperability System

## Overview

Healthcare AI Interoperability System is a modular healthcare platform that combines HL7 FHIR interoperability standards with artificial intelligence and machine learning techniques for patient risk assessment.

The system is designed using a microservice architecture where separate frontend, interoperability, AI, and ML components communicate through REST APIs. The platform enables standardized healthcare data exchange, patient analysis, machine learning prediction, and persistent storage of patient history.

The project demonstrates the integration of healthcare interoperability concepts with intelligent analytical services through a lightweight MVP architecture.

---

## System Architecture

The system consists of four main components:

### Frontend Application
- User interface for patient data input
- Risk visualization and patient history display
- Patient loading from database

### FHIR Service
- Handles healthcare interoperability
- Validates and transforms FHIR patient resources
- Manages communication with AI service
- Stores patient data in MongoDB
- Provides Swagger/OpenAPI documentation

### AI Service
- Acts as the analytical orchestration layer
- Processes standardized healthcare data
- Communicates with the ML microservice
- Organizes patient risk analysis workflow

### ML Service
- Python FastAPI microservice
- Uses trained scikit-learn models
- Executes patient risk prediction
- Returns LOW / MEDIUM / HIGH risk classification

---

## Architecture Diagram

```text
                    ┌──────────────────────┐
                    │      Frontend        │
                    │ HTML / CSS / JS UI   │
                    │ Patient Interface    │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                  ┌────────────────────────────┐
                  │        FHIR Service        │
                  │ Node.js + Express          │
                  │                            │
                  │ • FHIR Validation          │
                  │ • Patient Processing       │
                  │ • MongoDB Integration      │
                  │ • Swagger Documentation    │
                  └──────────┬─────────────────┘
                             │ REST API
                             ▼
                  ┌────────────────────────────┐
                  │         AI Service         │
                  │ Node.js Microservice       │
                  │                            │
                  │ • Risk Workflow            │
                  │ • AI Communication Layer   │
                  │ • Business Logic           │
                  └──────────┬─────────────────┘
                             │ HTTP Request
                             ▼
                  ┌────────────────────────────┐
                  │         ML Service         │
                  │ Python + FastAPI           │
                  │ scikit-learn               │
                  │                            │
                  │ • Logistic Regression      │
                  │ • Decision Tree            │
                  │ • Random Forest            │
                  │ • SVM                      │
                  │ • Risk Prediction          │
                  └──────────┬─────────────────┘
                             │
                             ▼
                  ┌────────────────────────────┐
                  │          MongoDB           │
                  │     Patient Storage        │
                  │     Analysis History       │
                  └────────────────────────────┘
```

---

## Machine Learning Model

The ML microservice performs patient risk prediction using supervised machine learning methods implemented with the scikit-learn library.

The system evaluates multiple classification algorithms:

- Logistic Regression
- Decision Tree
- Random Forest
- Support Vector Machine (SVM)

The best-performing model is automatically selected and used by the ML service during prediction. Based on model evaluation, Decision Tree achieved the best performance and was saved as `model.pkl`.

### Input Features
- Age
- Blood Pressure
- Cholesterol

### Prediction Output
- LOW risk
- MEDIUM risk
- HIGH risk

---

## Database Integration

MongoDB is used for persistent storage of patient analysis data.

The database stores:
- Patient personal information
- Health parameters
- Risk prediction results
- Analysis timestamps

Mongoose is used as the ODM layer for communication between the FHIR service and MongoDB.

---

## Technologies

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### AI Layer
- Node.js AI orchestration service
- REST communication workflow

### Machine Learning
- Python
- FastAPI
- scikit-learn
- pandas
- joblib

### Database
- MongoDB
- Mongoose

### Standards & Tools
- HL7 FHIR
- REST API
- Swagger/OpenAPI
- Git & GitHub

---

## Project Structure

```text
project/
│
├── frontend/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── backend/
│   ├── ai-service/
│   ├── fhir-service/
│   └── ml-service/
│
├── package.json
├── package-lock.json
└── README.md
```

---

## Running the System

### 1. Start MongoDB

```bash
brew services start mongodb-community
```

### 2. Start ML Service

```bash
cd backend/ml-service
python3 -m uvicorn app:app --reload --port 5000
```

### 3. Start AI Service

```bash
cd backend/ai-service
node aiService.js
```

### 4. Start FHIR Service

```bash
cd backend/fhir-service
node fhirService.js
```

### 5. Open Frontend

Open:

```text
frontend/index.html
```

in the browser.

---

## API Endpoints

### FHIR Service

#### Analyze Patient

```http
POST /fhir/patient
```

Processes FHIR patient data and executes AI-based risk analysis.

---

#### Get Patient

```http
GET /fhir/patient/:id
```

Loads patient information from MongoDB using patient ID.

---

#### Get Patient History

```http
GET /fhir/history
```

Returns stored patient analysis history.

---

## Swagger/OpenAPI Documentation

FHIR API documentation is available at:

```text
http://localhost:3000/api-docs
```

The documentation includes:
- endpoint descriptions,
- request examples,
- response schemas,
- API testing interface.

---

## System Features

- HL7 FHIR patient processing
- AI-assisted patient analysis
- ML-based risk prediction
- MongoDB patient storage
- Patient history tracking
- Dynamic risk visualization
- Swagger/OpenAPI API documentation
- Modular microservice architecture

---

## Future Improvements

- Integration with real healthcare datasets
- Advanced machine learning models
- Docker containerization
- Authentication and authorization
- Expanded FHIR resource support
- Advanced healthcare analytics
- Deployment to cloud infrastructure

---

## Author

Tijana Stankovic
