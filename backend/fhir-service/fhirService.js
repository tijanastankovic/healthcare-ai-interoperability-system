require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const patientRoutes = require('./routes/patientRoutes');
const connectDB = require('./database/db');

connectDB();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title:
        "FHIR-Based Healthcare Interoperability System",
      version: "1.0.0",
      description:
        "API for exchanging FHIR patient data and performing AI-based risk analysis"
    },
    tags: [
      {
        name: "Patient",
        description:
          "Operations related to patient data"
      }
    ]
  },

  apis: ["./routes/patientRoutes.js"]
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    body { background-color: #121212 }
  `
}));

app.use(helmet());

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origin is not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

app.use('/fhir', patientRoutes);

app.listen(process.env.PORT, () => {
  console.log("FHIR service running on port 3000");
});