require('dotenv').config();
const express = require('express');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(express.json());

app.use('/', aiRoutes);

app.listen(process.env.PORT, () => {
  console.log("AI service running on port 4000");
});