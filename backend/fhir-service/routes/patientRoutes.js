const express = require('express');
const mongoose = require("mongoose");

const router = express.Router();

const { validateBundle } = require('../validators/patientValidator');
const { generateRandomPatient, calculateAge } = require('../utils/patientUtils');
const { analyzeRisk } = require('../services/aiClientService');
const { patientsDB } = require('../storage/memoryStorage');

const Patient = require('../models/Patient');

/**
 * @swagger
 * /fhir/patient:
 *   post:
 *     tags:
 *       - Patient
 *     summary: Analyze and save a patient
 *     description: Receives a FHIR Bundle, performs risk analysis and saves the patient.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '201':
 *         description: Patient analyzed and saved
 *       '400':
 *         description: Invalid FHIR Bundle
 *       '422':
 *         description: Data is not supported by the ML model
 *       '500':
 *         description: Unable to process FHIR Bundle
 *
 * /fhir/patient/{id}:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Get patient by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Patient loaded successfully
 *       '400':
 *         description: Invalid patient ID
 *       '404':
 *         description: Patient not found
 *       '500':
 *         description: Unable to load patient
 *
 *   delete:
 *     tags:
 *       - Patient
 *     summary: Delete patient by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Patient deleted successfully
 *       '400':
 *         description: Invalid patient ID
 *       '404':
 *         description: Patient not found
 *       '500':
 *         description: Unable to delete patient
 *
 * /fhir/patient/{id}/bundle:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Get the original FHIR Bundle
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: FHIR Bundle loaded successfully
 *       '400':
 *         description: Invalid patient ID
 *       '404':
 *         description: Patient or FHIR Bundle not found
 *       '500':
 *         description: Unable to load FHIR Bundle
 *
 * /fhir/history:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Get patient analysis history
 *     responses:
 *       '200':
 *         description: Patient history loaded successfully
 *       '500':
 *         description: Unable to fetch patient history
 */

function getObservationValue(observations, code) {
  const observation = observations.find((item) =>
    item.code?.coding?.some((coding) => coding.code === code)
  );

  if (!observation) {
    return undefined;
  }

  if (observation.valueQuantity?.value !== undefined) {
    return Number(observation.valueQuantity.value);
  }

  if (observation.valueInteger !== undefined) {
    return Number(observation.valueInteger);
  }

  if (observation.valueDecimal !== undefined) {
    return Number(observation.valueDecimal);
  }

  return undefined;
}

function validatePatientId(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "Invalid patient ID"
    });
  }

  next();
}

// POST /fhir/patient
router.post("/patient", async (req, res) => {
  const bundle = req.body;

  console.log(
    `[${new Date().toISOString()}] Received FHIR Bundle:`,
    JSON.stringify(bundle, null, 2)
  );

  const validationResult =
  validateBundle(bundle);

  if (!validationResult.valid) {
    console.warn(
      "FHIR Bundle validation failed:",
      validationResult.error
    );

    return res.status(400).json({
      error: validationResult.error
    });
  }

  try {
    const resources = bundle.entry
      .map((entry) => entry.resource)
      .filter(Boolean);

    const patientResource = resources.find(
      (resource) => resource.resourceType === "Patient"
    );

    const observations = resources.filter(
      (resource) => resource.resourceType === "Observation"
    );

    if (!["male", "female"].includes(patientResource.gender)) {
      return res.status(422).json({
        error:
          "The current ML model supports only male and female gender values"
      });
    }

    const transformedData = {
      age: calculateAge(patientResource.birthDate),

      bloodPressure: getObservationValue(
        observations,
        "trestbps"
      ),

      cholesterol: getObservationValue(
        observations,
        "chol"
      ),

      sex: patientResource.gender === "male" ? 1 : 0,

      cp: getObservationValue(
        observations,
        "cp"
      ),

      fbs: getObservationValue(
        observations,
        "fbs"
      ),

      restecg: getObservationValue(
        observations,
        "restecg"
      ),
      
      thalach: getObservationValue(
        observations,
        "thalach"
      ),

      exang: getObservationValue(
        observations,
        "exang"
      ),

      oldpeak: getObservationValue(
        observations,
        "oldpeak"
      ),

      slope: getObservationValue(
        observations,
        "slope"
      ),

      ca: getObservationValue(
        observations,
        "ca"
      ),

      thal: getObservationValue(
        observations,
        "thal"
      )
    };

    console.log(
      `[${new Date().toISOString()}] Transformed ML data:`,
      transformedData
    );

    const result = await analyzeRisk(transformedData);

    console.log(
      `[${new Date().toISOString()}] AI response:`,
      result
    );

    const savedPatient = await Patient.create({
      firstName:
        patientResource.name[0].given[0].trim(),

      lastName:
        patientResource.name[0].family.trim(),

      birthDate: patientResource.birthDate,
      
      age: transformedData.age,
      bloodPressure: transformedData.bloodPressure,
      cholesterol: transformedData.cholesterol,
      sex: transformedData.sex,
      cp: transformedData.cp,
      fbs: transformedData.fbs,
      restecg: transformedData.restecg,
      thalach: transformedData.thalach,
      exang: transformedData.exang,
      oldpeak: transformedData.oldpeak,
      slope: transformedData.slope,
      ca: transformedData.ca,
      thal: transformedData.thal,

      risk: result.risk,

      fhirBundle: bundle
    });

    console.log("SAVED PATIENT:");
    console.log(savedPatient);

    const test = await Patient.findById(savedPatient._id);

    console.log("FROM MONGODB:");
    console.log(test);  

    patientsDB[savedPatient._id.toString()] = {
      id: savedPatient._id.toString(),
      bundle,
      risk: result.risk
    };

    return res.status(201).json({
      status: "Processed",
      id: savedPatient._id,
      fhirPatientId: patientResource.id,
      result,
      risk: result.risk
    });

  } catch (err) {
    console.error(
      "Error processing FHIR Bundle:",
      err
    );

    return res.status(500).json({
      error: "Unable to process FHIR Bundle"
    });
  }
});

// GET /fhir/patient/:id
router.get(
  "/patient/:id",
  validatePatientId,
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);

      if (!patient) {
        return res.status(404).json({
          error: "Patient not found"
        });
      }

      return res.status(200).json(patient);
    } catch (err) {
      console.error("Error loading patient:", err.message);

      return res.status(500).json({
        error: "Unable to load patient"
      });
    }
  }
);

// GET /fhir/patient/:id/bundle
router.get(
  "/patient/:id/bundle",
  validatePatientId,
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);

      if (!patient) {
        return res.status(404).json({
          error: "Patient not found"
        });
      }

      if (!patient.fhirBundle) {
        return res.status(404).json({
          error: "FHIR Bundle not found for this patient"
        });
      }

      return res.status(200).json(patient.fhirBundle);
    } catch (err) {
      console.error(
        "Error loading FHIR Bundle:",
        err.message
      );

      return res.status(500).json({
        error: "Unable to load FHIR Bundle"
      });
    }
  }
);

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

// DELETE /fhir/patient/:id
router.delete(
  "/patient/:id",
  validatePatientId,
  async (req, res) => {
    try {
      const deletedPatient =
        await Patient.findByIdAndDelete(req.params.id);

      if (!deletedPatient) {
        return res.status(404).json({
          error: "Patient not found"
        });
      }

      delete patientsDB[req.params.id];

      return res.status(200).json({
        status: "Deleted",
        id: deletedPatient._id
      });
    } catch (err) {
      console.error(
        "Error deleting patient:",
        err.message
      );

      return res.status(500).json({
        error: "Unable to delete patient"
      });
    }
  }
);

module.exports = router;