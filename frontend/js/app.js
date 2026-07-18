let lastPatientId = null;

function createObservation({
  code,
  display,
  value,
  unit = null,
  patientReference
}) {
  const observation = {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [
        {
          system: "https://example.org/fhir/CodeSystem/heart-disease-features",
          code,
          display
        }
      ],
      text: display
    },
    subject: {
      reference: patientReference
    },
    effectiveDateTime: new Date().toISOString()
  };

  if (unit) {
    observation.valueQuantity = {
      value,
      unit
    };
  } else {
    observation.valueInteger = value;
  }

  return observation;
}

function clearAnalyzeResult() {
  const resultBox = document.getElementById("analyzeResult");

  resultBox.innerHTML = "";
  resultBox.style.display = "none";
}

// ANALYZE
async function send() {
  const patientId = crypto.randomUUID();
  const patientReference = `urn:uuid:${patientId}`;

  const sex = Number(document.getElementById("sex").value);

  const restecgValue =
  document.getElementById("restecg").value;

  if (restecgValue === "") {
    window.alert("Please select the resting ECG result.");
    return;
  }

  const data = {
    resourceType: "Bundle",
    type: "collection",
    timestamp: new Date().toISOString(),

    entry: [
      {
        fullUrl: patientReference,
        resource: {
          resourceType: "Patient",
          id: patientId,
          name: [
            {
              use: "official",
              given: [document.getElementById("name").value],
              family: document.getElementById("surname").value
            }
          ],
          gender: sex === 1 ? "male" : "female",
          birthDate: document.getElementById("birthDate").value
        }
      },

      {
        resource: createObservation({
          code: "trestbps",
          display: "Resting Blood Pressure",
          value: Number(document.getElementById("bp").value),
          unit: "mmHg",
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "chol",
          display: "Serum Cholesterol",
          value: Number(document.getElementById("chol").value),
          unit: "mg/dL",
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "cp",
          display: "Chest Pain Type",
          value: Number(document.getElementById("cp").value),
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "fbs",
          display: "Fasting Blood Sugar",
          value: Number(document.getElementById("fbs").value),
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "restecg",
          display: "Resting Electrocardiographic Results",
          value: Number(restecgValue),
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "thalach",
          display: "Maximum Heart Rate Achieved",
          value: Number(document.getElementById("thalach").value),
          unit: "beats/minute",
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "exang",
          display: "Exercise Induced Angina",
          value: Number(document.getElementById("exang").value),
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "oldpeak",
          display: "ST Depression Induced by Exercise",
          value: Number(document.getElementById("oldpeak").value),
          unit: "mV",
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "slope",
          display: "Slope of Peak Exercise ST Segment",
          value: Number(document.getElementById("slope").value),
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "ca",
          display: "Number of Affected Vessels",
          value: Number(document.getElementById("ca").value),
          patientReference
        })
      },

      {
        resource: createObservation({
          code: "thal",
          display: "Thalassemia Test Result",
          value: Number(document.getElementById("thal").value),
          patientReference
        })
      }
    ]
  };

  const result = await analyzePatient(data);

  const risk = result.result.risk;

  lastPatientId = result.id;

  renderAnalyzeResult(
    `${document.getElementById("name").value} ${
      document.getElementById("surname").value
    }`,
    risk,
    lastPatientId
  );

  loadHistory();
}

// LOAD
async function loadPatient() {
  const id = document.getElementById("loadId").value;

  const data = await getPatient(id);

  console.log("Loaded patient: ", data);

  renderLoadedPatient(data);

  clearAnalyzeResult();
}

// HISTORY
async function loadHistory() {
  const data = await getHistory();

  renderHistory(data);
}

// DELETE PATIENT
async function removePatient(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this patient?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deletePatient(id);

    closePatientModal();

    if (lastPatientId === id) {
      lastPatientId = null;
      clearAnalyzeResult();
    }

    await loadHistory();
  } catch (err) {
    console.error("Error deleting patient:", err);

    window.alert(err.message);
  }
}