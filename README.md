# Healthcare AI Interoperability System

## Overview

FHIR-Based Healthcare AI System is a modular healthcare platform that combines HL7 FHIR interoperability standards with AI-based patient risk assessment.

The system uses a microservice architecture with separate frontend, FHIR, and AI services communicating through REST APIs.

## Architecture

The project consists of three main components:

- Frontend Application
  - User interface for patient data input and risk visualization

- FHIR Service
  - Handles healthcare interoperability
  - Validates and transforms FHIR patient data
  - Communicates with the AI service

- AI Service
  - Performs patient risk analysis
  - Returns risk classification results

## Technologies

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### AI Layer
- JavaScript-based risk analysis
- Planned ML model integration

### Standards & Tools
- HL7 FHIR
- REST API
- Swagger/OpenAPI
- Git & GitHub

## Project Structure

```text
project/
│
├── frontend/
│
├── backend/
│   ├── fhir-service/
│   └── ai-service/
│
├── package.json
└── README.md
```

## Running the System

### 1. Install dependencies

```bash
npm install
```

### 2. Start FHIR service

```bash
cd backend/fhir-service
node fhirService.js
```

### 3. Start AI service

```bash
cd backend/ai-service
node aiService.js
```

### 4. Open frontend

Open `frontend/index.html` in browser.

## API Endpoints

### FHIR Service

#### Analyze Patient

```http
POST /fhir/patient
```

#### Get Patient

```http
GET /fhir/patient/:id
```

#### Get History

```http
GET /fhir/history
```

## Swagger Documentation

FHIR API documentation is available at:

```text
http://localhost:3000/api-docs
```

## Future Improvements

- Integration of machine learning models
- Database support
- Docker containerization
- Authentication and authorization
- Real FHIR resource support
- Advanced healthcare analytics

## Author

Tijana Stankovic
