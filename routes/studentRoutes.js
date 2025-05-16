const {
  getStudentProfile,
  getAttendanceData,
  getFeeDetails,
  getInternalMarks,
  getDashboardData
} = require("../controllers/studentController");
const authenticateToken = require("../middlewares/authenticateToken");

module.exports = (app) => {
  // Fast consolidated dashboard data route
  app.get("/dashboard-data", authenticateToken, getDashboardData);
  
  // Individual data routes
  app.get("/student-profile", authenticateToken, getStudentProfile);
  app.get("/attendance-data", authenticateToken, getAttendanceData);
  app.get("/fee-details", authenticateToken, getFeeDetails);
  app.get("/course-details", authenticateToken, getFeeDetails);
  app.get("/internal-marks", authenticateToken, getInternalMarks);
};
