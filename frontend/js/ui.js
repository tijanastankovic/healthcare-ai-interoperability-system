function getRiskClass(risk) {
  if (risk.includes("LOW")) return "low";
  if (risk.includes("MEDIUM")) return "medium";
  return "high";
}

// ANALYZE RESULT
function renderAnalyzeResult(patientName, risk, patientId) {
  const resultDiv =
    document.getElementById("analyzeResult");

  resultDiv.style.display = "block";

  const className = getRiskClass(risk);
  resultDiv.className = `result ${className}`;

  resultDiv.replaceChildren();

  const nameRow = document.createElement("div");
  const name = document.createElement("b");
  name.textContent = patientName;
  nameRow.appendChild(name);

  const riskRow = document.createElement("div");
  riskRow.textContent = `Risk: ${risk}`;

  const idRow = document.createElement("div");
  idRow.textContent = `ID: ${patientId}`;

  resultDiv.append(nameRow, riskRow, idRow);
}

// LOAD RESULT
function renderLoadedPatient(data) {
  console.log("LOADED PATIENT DATA:", data);

  const resultDiv = document.getElementById("loadResult");

  const firstName = data.firstName || "Unknown";
  const lastName = data.lastName || "";

  // POPULATE FORM
  document.getElementById("name").value = firstName;
  document.getElementById("surname").value = lastName;

  document.getElementById("birthDate").value =
    data.birthDate ?? "";
    
  document.getElementById("bp").value =
    data.bloodPressure ?? "";

  document.getElementById("chol").value =
    data.cholesterol ?? "";

  document.getElementById("sex").value =
    data.sex ?? "";

  document.getElementById("cp").value =
    data.cp ?? "";

  document.getElementById("fbs").value =
    data.fbs ?? "";

  const hasRestEcgObservation =
  data.fhirBundle?.entry?.some((entry) =>
    entry.resource?.resourceType === "Observation" &&
    entry.resource.code?.coding?.some(
      (coding) => coding.code === "restecg"
    )
  );

  document.getElementById("restecg").value =
    hasRestEcgObservation
      ? String(data.restecg)
      : "";

  document.getElementById("thalach").value =
    data.thalach ?? "";

  document.getElementById("exang").value =
    data.exang ?? "";

  document.getElementById("oldpeak").value =
    data.oldpeak ?? "";

  document.getElementById("slope").value =
    data.slope ?? "";

  document.getElementById("ca").value =
    data.ca ?? "";

  document.getElementById("thal").value =
    data.thal ?? "";

  const risk = data.risk || "Unknown";
  const className = getRiskClass(risk);

  resultDiv.className = `result ${className}`;
  resultDiv.replaceChildren();

  const nameRow = document.createElement("div");
  const name = document.createElement("b");

  name.textContent =
    `${firstName} ${lastName}`.trim();

  nameRow.appendChild(name);

  const riskRow = document.createElement("div");
  riskRow.textContent = `Risk: ${risk}`;

  resultDiv.append(nameRow, riskRow);
}

// HISTORY
function renderHistory(data) {
  const list = document.getElementById("historyList");

  list.replaceChildren();

  data.forEach((item) => {
    const risk = item.risk || "Unknown";
    const color = getRiskClass(risk);

    const card = document.createElement("div");
    card.className = `history-item ${color}`;

    const main = document.createElement("div");
    main.className = "history-main";

    const left = document.createElement("div");
    left.className = "history-left";

    const name = document.createElement("div");
    name.className = "history-name";
    name.textContent =
      `${item.firstName || "Unknown"} ${item.lastName || ""}`.trim();

    const riskRow = document.createElement("div");
    riskRow.append("Risk: ");

    const riskText = document.createElement("span");
    riskText.className = `risk-text ${color}`;
    riskText.textContent = risk;

    riskRow.appendChild(riskText);
    left.append(name, riskRow);

    const right = document.createElement("div");
    right.className = "history-right";

    const idRow = document.createElement("div");
    idRow.textContent = `ID: ${item._id}`;

    const dateRow = document.createElement("div");

    const date = item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "";

    dateRow.textContent = `Date: ${date}`;

    right.append(idRow, dateRow);

    const detailsButton = document.createElement("button");
    detailsButton.className = "details-btn";
    detailsButton.textContent = "Details";

    detailsButton.addEventListener("click", () => {
      openPatientModal(item);
    });

    main.append(left, right, detailsButton);
    card.appendChild(main);
    list.appendChild(card);
  });
};

function getRestEcgLabel(item) {
  const hasRestEcgObservation =
    item.fhirBundle?.entry?.some((entry) =>
      entry.resource?.resourceType === "Observation" &&
      entry.resource.code?.coding?.some(
        (coding) => coding.code === "restecg"
      )
    );

  if (!hasRestEcgObservation) {
    return "N/A";
  }

  const labels = {
    0: "Normal",
    1: "ST-T Wave Abnormality",
    2: "Left Ventricular Hypertrophy"
  };

  return labels[item.restecg] ?? "N/A";
}

function displayValue(value) {
  return value ?? "N/A";
}

function addPatientDetail(container, label, value) {
  const row = document.createElement("p");

  const labelElement = document.createElement("b");
  labelElement.textContent = `${label}:`;

  const valueText = document.createTextNode(
    ` ${displayValue(value)}`
  );

  row.append(labelElement, valueText);
  container.appendChild(row);
}

function openPatientModal(item) {
  const modal = document.getElementById("patientModal");
  const details = document.getElementById("patientDetails");

  details.replaceChildren();

  const fullName =
    `${item.firstName || "Unknown"} ${item.lastName || ""}`.trim();

  addPatientDetail(details, "Name", fullName);
  addPatientDetail(details, "Risk", item.risk);
  addPatientDetail(details, "Age", item.age);
  addPatientDetail(
    details,
    "Blood Pressure",
    item.bloodPressure
  );
  addPatientDetail(
    details,
    "Cholesterol",
    item.cholesterol
  );
  addPatientDetail(details, "Gender", item.sex);
  addPatientDetail(
    details,
    "Chest Pain Type",
    item.cp
  );
  addPatientDetail(
    details,
    "Fasting Blood Sugar",
    item.fbs
  );
  addPatientDetail(
    details,
    "Resting ECG",
    getRestEcgLabel(item)
  );
  addPatientDetail(
    details,
    "Max Heart Rate",
    item.thalach
  );
  addPatientDetail(
    details,
    "Exercise Angina",
    item.exang
  );
  addPatientDetail(details, "Oldpeak", item.oldpeak);
  addPatientDetail(details, "ST Slope", item.slope);
  addPatientDetail(
    details,
    "Affected Vessels",
    item.ca
  );
  addPatientDetail(
    details,
    "Thalassemia",
    item.thal
  );
  addPatientDetail(details, "ID", item._id);

  const actions = document.createElement("div");
  actions.className = "modal-actions";

  const deleteButton = document.createElement("button");
  deleteButton.className = "modal-delete-btn";
  deleteButton.textContent = "Delete Patient";

  deleteButton.addEventListener("click", () => {
    removePatient(item._id);
  });

  actions.appendChild(deleteButton);
  details.appendChild(actions);

  modal.classList.remove("hidden");
}

function closePatientModal() {
  document
    .getElementById("patientModal")
    .classList.add("hidden");
}