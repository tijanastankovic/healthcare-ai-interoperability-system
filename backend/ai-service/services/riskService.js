function assessRisk(patient) {
  let score = 0;

  if (patient.bloodPressure > 140) score += 2;
  if (patient.cholesterol > 6) score += 2;
  if (patient.age > 50) score += 1;

  if (score >= 4) return "HIGH RISK";
  if (score >= 2) return "MEDIUM RISK";
  return "LOW RISK";
}

module.exports = {
  assessRisk
};