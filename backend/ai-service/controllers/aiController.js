const { assessRisk } = require('../services/riskService');

async function analyzePatient(req, res) {
  try {
    const patient = req.body;
    const result = await assessRisk(patient);

    res.json({
      risk: result.risk,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("ML service error:", error.message);

    res.status(500).json({
      error: "ML service unavailable"
    });
  }
}

module.exports = {
  analyzePatient
};