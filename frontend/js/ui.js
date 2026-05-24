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

  const firstName = data.name?.[0]?.given?.[0] || "Unknown";
  const lastName = data.name?.[0]?.family || "";

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
      <b>${item.patient}</b><br>
      Risk: ${item.risk}
    `;

    list.appendChild(div);
  });
}