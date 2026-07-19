function createValidationError(error) {
  return {
    valid: false,
    error
  };
}

function getObservationValue(observation) {
  if (
    observation.valueQuantity?.value !== undefined
  ) {
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

  return parsedDate <= currentDate;
}

function validateObservationRanges(observations) {
  const rules = {
    trestbps: {
      minimum: 50,
      maximum: 300,
      integer: false,
      error:
        "Blood pressure must be between 50 and 300 mmHg."
    },

    chol: {
      minimum: 50,
      maximum: 700,
      integer: false,
      error:
        "Cholesterol must be between 50 and 700 mg/dL."
    },

    cp: {
      minimum: 0,
      maximum: 3,
      integer: true,
      error:
        "Chest pain type must have a whole-number value between 0 and 3."
    },

    fbs: {
      minimum: 0,
      maximum: 1,
      integer: true,
      error:
        "Fasting blood sugar category must be either 0 or 1."
    },

    restecg: {
      minimum: 0,
      maximum: 2,
      integer: true,
      error:
        "Resting ECG must have a whole-number value between 0 and 2."
    },

    thalach: {
      minimum: 40,
      maximum: 250,
      integer: false,
      error:
        "Maximum heart rate must be between 40 and 250 beats per minute."
    },

    exang: {
      minimum: 0,
      maximum: 1,
      integer: true,
      error:
        "Exercise-induced angina must be either 0 or 1."
    },

    oldpeak: {
      minimum: 0,
      maximum: 10,
      integer: false,
      error:
        "Oldpeak must be between 0 and 10."
    },

    slope: {
      minimum: 0,
      maximum: 2,
      integer: true,
      error:
        "ST slope must have a whole-number value between 0 and 2."
    },

    ca: {
      minimum: 0,
      maximum: 4,
      integer: true,
      error:
        "Affected vessels must have a whole-number value between 0 and 4."
    },

    thal: {
      minimum: 0,
      maximum: 3,
      integer: true,
      error:
        "Thalassemia result must have a whole-number value between 0 and 3."
    }
  };

  for (const [code, rule] of Object.entries(rules)) {
    const value = observations.get(code);

    if (
      value < rule.minimum ||
      value > rule.maximum
    ) {
      return createValidationError(rule.error);
    }

    if (
      rule.integer &&
      !Number.isInteger(value)
    ) {
      return createValidationError(rule.error);
    }
  }

  return {
    valid: true
  };
}

function validateBundle(data) {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return createValidationError(
      "Request body must contain a valid FHIR Bundle."
    );
  }

  if (data.resourceType !== "Bundle") {
    return createValidationError(
      'The resourceType field must have the value "Bundle".'
    );
  }

  if (data.type !== "collection") {
    return createValidationError(
      'The FHIR Bundle type must have the value "collection".'
    );
  }

  if (
    !Array.isArray(data.entry) ||
    data.entry.length === 0
  ) {
    return createValidationError(
      "The FHIR Bundle must contain at least one entry."
    );
  }

  const resources = data.entry
    .map((entry) => entry.resource)
    .filter(Boolean);

  const patient = resources.find(
    (resource) =>
      resource.resourceType === "Patient"
  );

  const observations = resources.filter(
    (resource) =>
      resource.resourceType === "Observation"
  );

  if (!patient) {
    return createValidationError(
      "The FHIR Bundle must contain a Patient resource."
    );
  }

  const firstName =
    patient.name?.[0]?.given?.[0];

  const lastName =
    patient.name?.[0]?.family;

  if (
    typeof firstName !== "string" ||
    firstName.trim().length === 0 ||
    firstName.trim().length > 100
  ) {
    return createValidationError(
      "The patient must contain a valid given name."
    );
  }

  if (
    typeof lastName !== "string" ||
    lastName.trim().length === 0 ||
    lastName.trim().length > 100
  ) {
    return createValidationError(
      "The patient must contain a valid family name."
    );
  }

  const allowedGenders = [
    "male",
    "female",
    "other",
    "unknown"
  ];

  if (
    typeof patient.gender !== "string" ||
    !allowedGenders.includes(patient.gender)
  ) {
    return createValidationError(
      "Gender must be male, female, other or unknown."
    );
  }

  if (!isValidBirthDate(patient.birthDate)) {
    return createValidationError(
      "Birth date must be a valid date in YYYY-MM-DD format and cannot be in the future."
    );
  }

  const requiredObservations = {
    trestbps: "Blood pressure is required.",
    chol: "Cholesterol is required.",
    cp: "Chest pain type is required.",
    fbs: "Fasting blood sugar is required.",
    restecg: "Resting ECG is required.",
    thalach: "Maximum heart rate is required.",
    exang: "Exercise-induced angina is required.",
    oldpeak: "Oldpeak is required.",
    slope: "ST slope is required.",
    ca: "Affected vessels value is required.",
    thal: "Thalassemia result is required."
  };

  const observationMap = new Map();

  for (const observation of observations) {
    if (observation.status !== "final") {
      return createValidationError(
        'Every Observation must have status "final".'
      );
    }

    const code =
      getObservationCode(observation);

    if (!code) {
      return createValidationError(
        "Every Observation must contain a valid code."
      );
    }

    const value =
      getObservationValue(observation);

    if (
      typeof value !== "number" ||
      !Number.isFinite(value)
    ) {
      return createValidationError(
        `The ${code} observation must contain a valid numeric value.`
      );
    }

    if (observationMap.has(code)) {
      return createValidationError(
        `The ${code} observation must not appear more than once.`
      );
    }

    observationMap.set(code, value);
  }

  for (
    const [code, error] of
    Object.entries(requiredObservations)
  ) {
    if (!observationMap.has(code)) {
      return createValidationError(error);
    }
  }

  return validateObservationRanges(
    observationMap
  );
}

module.exports = {
  validateBundle
};