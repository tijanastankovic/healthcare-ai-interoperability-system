function getObservationValue(observation) {
  if (observation.valueQuantity?.value !== undefined) {
    return observation.valueQuantity.value;
  }

  if (observation.valueInteger !== undefined) {
    return observation.valueInteger;
  }

  if (observation.valueDecimal !== undefined) {
    return observation.valueDecimal;
  }

  return undefined;
}

function getObservationCode(observation) {
  return observation.code?.coding?.[0]?.code;
}

function validateBundle(data) {
  if (!data || data.resourceType !== "Bundle") {
    return false;
  }

  if (data.type !== "collection") {
    return false;
  }

  if (!Array.isArray(data.entry) || data.entry.length === 0) {
    return false;
  }

  const resources = data.entry
    .map((entry) => entry.resource)
    .filter(Boolean);

  const patient = resources.find(
    (resource) => resource.resourceType === "Patient"
  );

  const observations = resources.filter(
    (resource) => resource.resourceType === "Observation"
  );

  if (!patient) {
    return false;
  }

  const firstName = patient.name?.[0]?.given?.[0];
  const lastName = patient.name?.[0]?.family;

  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    firstName.trim().length === 0 ||
    lastName.trim().length === 0 ||
    firstName.trim().length > 100 ||
    lastName.trim().length > 100
  ) {
    return false;
  }

  if (!["male", "female", "other", "unknown"].includes(patient.gender)) {
    return false;
  }

  if (!isValidBirthDate(patient.birthDate)) {
    return false;
  }

  const requiredObservationCodes = [
    "trestbps",
    "chol",
    "cp",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal"
  ];

  const observationMap = new Map();

  for (const observation of observations) {
    if (observation.status !== "final") {
      return false;
    }

    const code = getObservationCode(observation);
    const value = getObservationValue(observation);

    if (!code || typeof value !== "number" || !Number.isFinite(value)) {
      return false;
    }

    if (observationMap.has(code)) {
      return false;
    }

    observationMap.set(code, value);
  }

  for (const requiredCode of requiredObservationCodes) {
    if (!observationMap.has(requiredCode)) {
      return false;
    }
  }

  return validateObservationRanges(observationMap);
}

function isValidBirthDate(birthDate) {
  if (typeof birthDate !== "string") {
    return false;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(birthDate)) {
    return false;
  }

  const [year, month, day] =
    birthDate.split("-").map(Number);

  const parsedDate = new Date(
    Date.UTC(year, month - 1, day)
  );

  const isRealDate =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;

  if (!isRealDate) {
    return false;
  }

  const today = new Date();

  const currentDate = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  );

  if (parsedDate > currentDate) {
    return false;
  }

  return true;
}

function validateObservationRanges(observations) {
  const ranges = {
    trestbps: [50, 300],
    chol: [50, 700],
    cp: [0, 3],
    fbs: [0, 1],
    restecg: [0, 2],
    thalach: [40, 250],
    exang: [0, 1],
    oldpeak: [0, 10],
    slope: [0, 2],
    ca: [0, 4],
    thal: [0, 3]
  };

  for (const [code, [minimum, maximum]] of Object.entries(ranges)) {
    const value = observations.get(code);

    if (value < minimum || value > maximum) {
      return false;
    }
  }

  const categoricalCodes = [
    "cp",
    "fbs",
    "restecg",
    "exang",
    "slope",
    "ca",
    "thal"
  ];

  for (const code of categoricalCodes) {
    const value = observations.get(code);

    if (!Number.isInteger(value)) {
      return false;
    }
  }

  return true;
}

module.exports = {
  validateBundle
};