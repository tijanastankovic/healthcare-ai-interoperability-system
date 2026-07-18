const axios = require("axios");

async function assessRisk(patient) {
  const baseUrl = process.env.ML_SERVICE_URL?.trim();

  console.log("ML_SERVICE_URL:", baseUrl);
  console.log("ML request data:", patient);

  if (!baseUrl) {
    throw new Error(
      "ML_SERVICE_URL is missing. Check the AI service .env file."
    );
  }

  const url = `${baseUrl}/predict`;

  console.log("Calling ML service:", url);

  try {
    const response = await axios.post(url, patient, {
      headers: {
        "Content-Type": "application/json"
      },
      proxy: false
    });

    console.log("ML response:", response.data);

    return response.data;
  } catch (error) {
    console.error("ML service status:", error.response?.status);
    console.error("ML service response:", error.response?.data);
    console.error("ML service error:", error.message);

    throw error;
  }
}

module.exports = {
  assessRisk
};