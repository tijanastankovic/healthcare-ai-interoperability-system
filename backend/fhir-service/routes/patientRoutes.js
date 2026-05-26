const express = require('express');
const router = express.Router();

const { validatePatient } = require('../validators/patientValidator');
const { generateRandomPatient, calculateAge } = require('../utils/patientUtils');
const { analyzeRisk } = require('../services/aiClientService');
const { patientsDB } = require('../storage/memoryStorage');

const Patient = require('../models/Patient');

// POST /fhir/patient
router.post('/patient', async (req, res) => {
  const patient = req.body;

  console.log(`[${new Date().toISOString()}] Received patient:`, patient);

  if (!validatePatient(patient)) {
    return res.status(400).json({
      error: "Invalid FHIR data"
    });
  }

  try {
    const transformedData = {
      age: calculateAge(patient.birthDate),
      bloodPressure: patient.extension.bloodPressure,
      cholesterol: patient.extension.cholesterol
    };

    const result = await analyzeRisk(transformedData);

    console.log(`[${new Date().toISOString()}] AI response:`, result);

    const newId = Date.now().toString();

    patientsDB[newId] = {
      ...patient,
      id: newId,
      risk: result.risk
    };

    await Patient.create({
      firstName: patient.name?.[0]?.given?.[0] || "Unknown",
      lastName: patient.name?.[0]?.family || "Unknown",
      age: transformedData.age,
      bloodPressure: transformedData.bloodPressure,
      cholesterol: transformedData.cholesterol,
      risk: result.risk
    });

    res.json({
      status: "Processed",
      id: newId,
      result: result,
      risk: result.risk
    });

  } catch (err) {
    console.error("Error calling AI service:", err.message);

    res.status(500).json({
      error: "AI service unavailable"
    });
  }
});

// GET /fhir/patient/:id
router.get('/patient/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        error: "Patient not found"
      });
    }

    res.status(200).json(patient);
  } catch (err) {
    res.status(500).json({
      error: "Unable to load patient"
    });
  }
});

// GET /fhir/history
router.get('/history', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    res.json(patients);
  } catch (err) {
    console.error("Error fetching patient history:", err.message);

    res.status(500).json({
      error: "Unable to fetch patient history"
    });
  }
});

module.exports = router;