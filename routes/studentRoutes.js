const {
  getStudentProfile,
  getAttendanceData,
  getFeeDetails,
  getInternalMarks,
  getGradeDetails,
} = require("../controllers/studentController");
const authenticateToken = require("../middlewares/authenticateToken");

module.exports = (app) => {
  app.get("/student-profile", authenticateToken, getStudentProfile);
  app.get("/attendance-data", authenticateToken, getAttendanceData);
  app.get("/fee-details", authenticateToken, getFeeDetails);
  app.get("/internal-marks", authenticateToken, getInternalMarks);
  app.get("/grade-details", authenticateToken, getGradeDetails);
};
