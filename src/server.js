const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});