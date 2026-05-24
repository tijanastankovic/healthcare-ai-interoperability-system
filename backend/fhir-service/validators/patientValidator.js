function validatePatient(data) {
  if (data.resourceType !== "Patient") return false;
  if (!data.name || !data.gender || !data.birthDate) return false;
  if (!data.extension) return false;
  if (typeof data.extension.bloodPressure !== "number") return false;
  if (typeof data.extension.cholesterol !== "number") return false;

  return true;
}

module.exports = {
  validatePatient
};