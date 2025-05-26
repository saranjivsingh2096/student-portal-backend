const {
  User,
  StudentProfile,
  AttendanceData,
  FeeDetails,
  InternalMarks,
  GradeDetails,
} = require("../models");

const getStudentProfile = async (req, res) => {
  let userKey = req.query.user;
  if (!userKey) return res.status(400).json({ message: "User key is missing." });
  userKey = userKey.toLowerCase();
  try {
    const user = await User.findOne({
      where: { username: userKey },
      include: [{ model: StudentProfile, required: false }]
    });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.StudentProfile) return res.status(404).json({ message: "Profile information not found." });

    const { id, UserId, ...filteredStudentProfile } = user.StudentProfile.toJSON();
    return res.status(200).json(filteredStudentProfile);
  } catch (error) {
    console.error("Error in getStudentProfile:", error);
    return res.status(500).json({ error: "Failed to fetch student profile." });
  }
};

const getAttendanceData = async (req, res) => {
  let userKey = req.query.user;
  if (!userKey) return res.status(400).json({ message: "User key is missing." });
  userKey = userKey.toLowerCase();
  try {
    const user = await User.findOne({ where: { username: userKey } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const attendanceData = await AttendanceData.findOne({ where: { UserId: user.id } });
    if (!attendanceData) return res.status(404).json({ message: "Attendance data not found." });
   
    const courseWiseAttendance = attendanceData.courseWiseAttendance || {};
    const cumulativeDataFromDB = attendanceData.cumulativeAttendance || {}; 
    let courseWiseData = Array.isArray(courseWiseAttendance.courseWiseAttendance) ? courseWiseAttendance.courseWiseAttendance : (Array.isArray(courseWiseAttendance) ? courseWiseAttendance : []);
  
    const response = {
      attendancePeriodStartDate: attendanceData.attendancePeriodStartDate,
      attendancePeriodEndDate: attendanceData.attendancePeriodEndDate,
      courseWiseAttendance: courseWiseData,
      cumulativeAttendance: cumulativeDataFromDB, 
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAttendanceData:", error);
    return res.status(500).json({ error: "Failed to fetch attendance data.", details: error.message });
  }
};

const getFeeDetails = async (req, res) => {
  let userKey = req.query.user;
  if (!userKey) return res.status(400).json({ message: "User key is missing." });
  userKey = userKey.toLowerCase();
  try {
    const user = await User.findOne({ where: { username: userKey } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const feeDetails = await FeeDetails.findAll({
      where: { UserId: user.id },
      attributes: [
        'feeType', 'yearMonth', 'raisedAmount', 'lastDateWithoutLateFee',
        'lastDateWithLateFee', 'feeWithLateFee', 'lastDateWithPenalty',
        'feeWithPenalty', 'paidAmount', 'concessionAmount', 'amountToPay',
        'minimumAmountAllowed', 'enterAmountToPay', 'paid'
      ],
      order: [['yearMonth', 'DESC']]
    });

    if (feeDetails.length === 0) {
      return res.status(404).json({ message: "No fee details found for this user." });
    }

    const unpaidFeeDetails = feeDetails.filter(fee => !fee.paid);
    const response = {
      allFees: feeDetails,
      unpaidFees: unpaidFeeDetails,
      summary: {
        totalUnpaid: unpaidFeeDetails.reduce((sum, fee) => sum + fee.amountToPay, 0),
        totalFees: feeDetails.length,
        unpaidFees: unpaidFeeDetails.length
      }
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getFeeDetails:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getInternalMarks = async (req, res) => {
  let userKey = req.query.user;
  if (!userKey) return res.status(400).json({ message: "User key is missing." });
  userKey = userKey.toLowerCase();
  try {
    const user = await User.findOne({ where: { username: userKey } });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (typeof user.id === 'undefined') {
      console.error(`[getInternalMarks] CRITICAL: user.id is undefined for userKey: ${userKey} after user was found.`);
      return res.status(500).json({ error: "Internal Server Error: User identifier processing failed." });
    }
    const internalMarksRecords = await InternalMarks.findAll({ where: { UserId: user.id } });
    if (!internalMarksRecords || internalMarksRecords.length === 0) {
      return res.status(404).json({ message: "No internal marks found for this user." });
    }
    const markDetails = internalMarksRecords.map(mark => {
      if (!mark.markDetails) {
        console.warn(`[getInternalMarks] Data integrity: Mark details missing for record ID: ${mark.id}, UserId: ${mark.UserId}`);
        return []; 
      }
      return mark.markDetails;
    }).flat();
    const response = {
      markDetails
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error(`[getInternalMarks] General error for userKey ${userKey}:`, error);
    return res.status(500).json({ error: "Failed to fetch internal marks." });
  }
};

const getGradeDetails = async (req, res) => {
  let userKey = req.query.user;
  if (!userKey) return res.status(400).json({ message: "User key is missing." });
  userKey = userKey.toLowerCase();
  try {
    const user = await User.findOne({ where: { username: userKey } });
    if (!user) return res.status(404).json({ message: "User not found." });
    const gradeDetailsData = await GradeDetails.findOne({ where: { UserId: user.id } });
    if (!gradeDetailsData) {
      return res.status(404).json({ message: "Grade details not found for this user." });
    }
    const response = gradeDetailsData.gradeDetails;
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching grade details:', error);
    return res.status(500).json({ error: "Failed to fetch grade details." });
  }
};

module.exports = {
  getStudentProfile,
  getAttendanceData,
  getFeeDetails,
  getInternalMarks,
  getGradeDetails
};
