let lastPatientId = null;

// ANALYZE
async function send() {
  const data = {
    resourceType: "Patient",
    name: [{
      given: [document.getElementById('name').value],
      family: document.getElementById('surname').value
    }],
    gender: "unknown",
    birthDate: document.getElementById('birthDate').value,
    extension: {
      bloodPressure: Number(document.getElementById('bp').value),
      cholesterol: Number(document.getElementById('chol').value)
    }
  };

  const result = await analyzePatient(data);

  const risk = result.result.risk;

  lastPatientId = result.id;

  renderAnalyzeResult(
    `${document.getElementById('name').value} ${document.getElementById('surname').value}`,
    risk,
    lastPatientId
  );

  loadHistory();
}

// LOAD
async function loadPatient() {
  const id = document.getElementById("loadId").value;

  const data = await getPatient(id);

  renderLoadedPatient(data);
}

// HISTORY
async function loadHistory() {
  const data = await getHistory();

  renderHistory(data);
}