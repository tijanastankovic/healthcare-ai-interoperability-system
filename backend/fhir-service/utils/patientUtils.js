function generateRandomPatient(id) {
  return {
    resourceType: "Patient",
    id: id,
    name: [{ given: ["Random"], family: "Patient" }],
    gender: "unknown",
    birthDate: "1985-01-01",
    extension: {
      bloodPressure: Math.floor(Math.random() * 60) + 100,
      cholesterol: (Math.random() * 4 + 3).toFixed(1)
    }
  };
}

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

module.exports = {
  generateRandomPatient,
  calculateAge
};