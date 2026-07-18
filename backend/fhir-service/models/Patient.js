const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,

  birthDate: String,
  
  age: Number,
  bloodPressure: Number,
  cholesterol: Number,
  sex: Number,
  cp: Number,
  fbs: Number,
  restecg: Number,
  thalach: Number,
  exang: Number,
  oldpeak: Number,
  slope: Number,
  ca: Number,
  thal: Number,

  risk: String,

  fhirBundle: {
    type: Object
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', patientSchema);