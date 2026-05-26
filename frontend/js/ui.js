function getRiskClass(risk) {
  if (risk.includes("LOW")) return "low";
  if (risk.includes("MEDIUM")) return "medium";
  return "high";
}

// ANALYZE RESULT
function renderAnalyzeResult(patientName, risk, patientId) {
  const resultDiv = document.getElementById("analyzeResult");

  const className = getRiskClass(risk);

  resultDiv.className = "result " + className;

  resultDiv.innerHTML = `
    <div><b>${patientName}</b></div>
    <div>Risk: ${risk}</div>
    <div>ID: ${patientId}</div>
  `;
}

// LOAD RESULT
function renderLoadedPatient(data) {
  const resultDiv = document.getElementById("loadResult");

  const firstName = data.firstName || "Unknown";
  const lastName = data.lastName || "";

  document.getElementById("name").value = firstName;
  document.getElementById("surname").value = lastName;
  document.getElementById("bp").value = data.bloodPressure || "";
  document.getElementById("chol").value = data.cholesterol || "";

  const className = getRiskClass(data.risk || "LOW");

  resultDiv.className = "result " + className;

  resultDiv.innerHTML = `
    <div><b>${firstName} ${lastName}</b></div>
    <div>Risk: ${data.risk || "Unknown"}</div>
  `;
}

// HISTORY
function renderHistory(data) {
  const list = document.getElementById("historyList");

  list.innerHTML = "";

  data.forEach(item => {
    const color = getRiskClass(item.risk);

    const div = document.createElement("div");

    div.className = "history-item";
    div.classList.add(color);

    div.innerHTML = `
      <b>${item.firstName} ${item.lastName}</b><br>
      Risk: ${item.risk}<br>
      ID: ${item._id}
    `;

    list.appendChild(div);
  });
}