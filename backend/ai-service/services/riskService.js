
const axios = require('axios');

async function assessRisk(patient) {
  const response = await axios.post(
    `${process.env.ML_SERVICE_URL}/predict`,
    patient
  );

  return response.data;
}

module.exports = {
  assessRisk
};