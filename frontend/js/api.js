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