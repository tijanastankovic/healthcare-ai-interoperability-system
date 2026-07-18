const API_BASE = "http://localhost:3000";

// SEND PATIENT
async function analyzePatient(data) {
  const res = await fetch(`${API_BASE}/fhir/patient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  return await res.json();
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