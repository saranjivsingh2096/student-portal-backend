const {
  getStudentProfile,
  getAttendanceData,
  getFeeDetails,
  getInternalMarks,
  getGradeDetails,
} = require("../controllers/studentController");
const authenticateToken = require("../middlewares/authenticateToken");

module.exports = (app) => {
  app.get("/student/profile", authenticateToken, getStudentProfile);
  app.get("/student/attendance-data", authenticateToken, getAttendanceData);
  app.get("/student/fee-details", authenticateToken, getFeeDetails);
  app.get("/student/internal-marks", authenticateToken, getInternalMarks);
  app.get("/student/grade-details", authenticateToken, getGradeDetails);
};
