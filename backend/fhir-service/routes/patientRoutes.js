const express = require('express');
const router = express.Router();

const { patientsDB, history } = require('../storage/memoryStorage');
const { validatePatient } = require('../validators/patientValidator');
const { generateRandomPatient, calculateAge } = require('../utils/patientUtils');
const { analyzeRisk } = require('../services/aiClientService');

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

    history.push({
      timestamp: new Date().toISOString(),
      patient: patient.name?.[0]?.given?.[0] || "Unknown",
      risk: result.risk
    });

    const newId = Date.now().toString();

    patientsDB[newId] = {
      ...patient,
      id: newId,
      risk: result.risk
    };

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
router.get('/patient/:id', (req, res) => {
  const id = req.params.id;

  let patient = patientsDB[id];

  if (!patient) {
    patient = generateRandomPatient(id);
  }

  res.status(200).json(patient);
});

// GET /fhir/history
router.get('/history', (req, res) => {
  res.json(history);
});

module.exports = router;