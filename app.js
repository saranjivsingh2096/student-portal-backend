const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

authRoutes(app);
studentRoutes(app);
transactionRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
