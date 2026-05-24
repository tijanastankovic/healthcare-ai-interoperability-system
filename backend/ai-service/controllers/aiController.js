const { assessRisk } = require('../services/riskService');

function analyzePatient(req, res) {
  const patient = req.body;
  const risk = assessRisk(patient);

  res.json({
    risk,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  analyzePatient
};