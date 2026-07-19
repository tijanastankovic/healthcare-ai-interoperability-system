const API_BASE = "http://localhost:3000";

async function parseApiResponse(
  response,
  fallbackMessage
) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      data.error ||
      data.issue?.[0]?.diagnostics ||
      fallbackMessage;

    const error = new Error(message);
    error.isUserSafe = true;

    throw error;
  }

  return data;
}

// SEND PATIENT
async function analyzePatient(data) {
  const response = await fetch(
    "http://localhost:3000/fhir/patient",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  return parseApiResponse(
    response,
    "Unable to process the patient data."
  );
}

// LOAD PATIENT
async function getPatient(id) {
  const res = await fetch(`${API_BASE}/fhir/patient/${id}`);
  return await res.json();
}

// HISTORY
async function getHistory() {
  const res = await fetch(`${API_BASE}/fhir/history`);
  return await res.json();
}

// DELETE PATIENT
async function deletePatient(id) {
  const url =
    `http://localhost:3000/fhir/patient/${encodeURIComponent(id)}`;

  console.log("DELETE URL:", url);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json"
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete patient");
  }

  return data;
}