const axios = require('axios');

async function analyzeRisk(data) {
  const response = await axios.post(
    `${process.env.AI_SERVICE_URL}/analyze`,
    data
  );

  return response.data;
}

module.exports = {
  analyzeRisk
};