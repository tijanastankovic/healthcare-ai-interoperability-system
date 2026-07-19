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

function renderAnalyzeError(message) {
  const resultDiv =
    document.getElementById("analyzeResult");

  resultDiv.style.display = "block";
  resultDiv.className = "result error";
  resultDiv.replaceChildren();

  const messageElement =
    document.createElement("div");

  messageElement.textContent = message;

  resultDiv.appendChild(messageElement);
}

function validateAnalyzeForm() {
  const requiredFields = [
    {
      id: "name",
      message:
        "The patient must contain a valid given name."
    },
    {
      id: "surname",
      message:
        "The patient must contain a valid family name."
    },
    {
      id: "sex",
      message:
        "The patient must contain a valid gender."
    },
    {
      id: "birthDate",
      message:
        "The patient must contain a valid birth date."
    },
    {
      id: "bp",
      message:
        "The patient must contain a valid blood pressure."
    },
    {
      id: "chol",
      message:
        "The patient must contain a valid cholesterol value."
    },
    {
      id: "cp",
      message:
        "The patient must contain a valid chest pain type."
    },
    {
      id: "fbs",
      message:
        "The patient must contain a valid fasting blood sugar value."
    },
    {
      id: "restecg",
      message:
        "The patient must contain a valid resting ECG result."
    },
    {
      id: "thalach",
      message:
        "The patient must contain a valid maximum heart rate."
    },
    {
      id: "exang",
      message:
        "The patient must contain a valid exercise angina value."
    },
    {
      id: "oldpeak",
      message:
        "The patient must contain a valid oldpeak value."
    },
    {
      id: "slope",
      message:
        "The patient must contain a valid ST slope."
    },
    {
      id: "ca",
      message:
        "The patient must contain a valid affected vessels value."
    },
    {
      id: "thal",
      message:
        "The patient must contain a valid thalassemia result."
    }
  ];

  for (const field of requiredFields) {
    const input =
      document.getElementById(field.id);

    if (
      !input ||
      input.value.trim() === ""
    ) {
      renderAnalyzeError(field.message);
      input?.focus();

      return false;
    }
  }

  return true;
}

// ANALYZE
async function send() {
  clearAnalyzeResult();

  if (!validateAnalyzeForm()) {
    return;
  }

  const birthDate =
    document.getElementById("birthDate").value;

  const restecgValue =
    document.getElementById("restecg").value;

  const patientId = crypto.randomUUID();
  const patientReference = `urn:uuid:${patientId}`;

  const sex = Number(
    document.getElementById("sex").value
  );

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
          birthDate: birthDate
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

  try {
    const result = await analyzePatient(data);

    const risk =
      result.result?.risk || result.risk;

    if (!risk) {
      throw new Error(
        "The server response does not contain a risk result."
      );
    }

    lastPatientId = result.id;

    renderAnalyzeResult(
      `${document.getElementById("name").value} ${
        document.getElementById("surname").value
      }`,
      risk,
      lastPatientId
    );

    await loadHistory();
  } catch (error) {
    console.error(
      "Unable to analyze patient:",
      error
    );

    const message = error.isUserSafe
      ? error.message
      : "Unable to process the patient data. Please try again.";

    renderAnalyzeError(message);
  }
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
  const confirmed =
    await showDeleteConfirmation();

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

let deleteConfirmationResolver = null;

function showDeleteConfirmation() {
  const modal = document.getElementById(
    "deleteConfirmModal"
  );

  modal.classList.remove("hidden");

  document
    .getElementById("cancelDeleteButton")
    .focus();

  return new Promise(resolve => {
    deleteConfirmationResolver = resolve;
  });
}

function resolveDeleteConfirmation(confirmed) {
  const modal = document.getElementById(
    "deleteConfirmModal"
  );

  modal.classList.add("hidden");

  if (deleteConfirmationResolver) {
    deleteConfirmationResolver(confirmed);
    deleteConfirmationResolver = null;
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const modal = document.getElementById(
      "deleteConfirmModal"
    );

    document
      .getElementById("cancelDeleteButton")
      .addEventListener("click", () => {
        resolveDeleteConfirmation(false);
      });

    document
      .getElementById("confirmDeleteButton")
      .addEventListener("click", () => {
        resolveDeleteConfirmation(true);
      });

    modal.addEventListener("click", event => {
      if (event.target === modal) {
        resolveDeleteConfirmation(false);
      }
    });

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Escape" &&
          !modal.classList.contains("hidden")
        ) {
          resolveDeleteConfirmation(false);
        }
      }
    );
  }
);