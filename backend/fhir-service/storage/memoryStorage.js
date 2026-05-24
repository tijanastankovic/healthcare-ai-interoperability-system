const patientsDB = {
  "1": {
    resourceType: "Patient",
    id: "1",
    name: [{ given: ["Marko"], family: "Markovic" }],
    gender: "male",
    birthDate: "1970-01-01",
    extension: { bloodPressure: 150, cholesterol: 6.5 }
  },
  "2": {
    resourceType: "Patient",
    id: "2",
    name: [{ given: ["Ana"], family: "Jovanovic" }],
    gender: "female",
    birthDate: "1990-05-10",
    extension: { bloodPressure: 120, cholesterol: 4.5 }
  }
};

const history = [];

module.exports = {
  patientsDB,
  history
};