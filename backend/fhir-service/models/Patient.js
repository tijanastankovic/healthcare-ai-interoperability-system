const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  bloodPressure: Number,
  cholesterol: Number,
  risk: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', patientSchema);