const {
  User,
  StudentProfile,
  AttendanceData,
  FeeDetails,
  InternalMarks,
} = require("../models");

const getStudentProfile = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    const user = await User.findOne({ where: { username: userKey } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const studentProfile = await StudentProfile.findOne({
      where: { UserId: user.id },
    });

    if (!studentProfile) {
      return res
        .status(404)
        .json({ message: "Profile information not found." });
    }

    const { id, UserId, ...filteredStudentProfile } = studentProfile.toJSON();
    return res.status(200).json(filteredStudentProfile);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch student profile." });
  }
};

const getAttendanceData = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    const user = await User.findOne({ where: { username: userKey } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const attendanceData = await AttendanceData.findOne({
      where: { UserId: user.id },
    });

    if (!attendanceData) {
      return res.status(404).json({ message: "Attendance data not found." });
    }

    const response = {
      attendancePeriodStartDate: attendanceData.attendancePeriodStartDate,
      attendancePeriodEndDate: attendanceData.attendancePeriodEndDate,
      courseWiseAttendance:
        attendanceData.courseWiseAttendance.courseWiseAttendance,
      cumulativeAttendance:
        attendanceData.cumulativeAttendance.cumulativeAttendance,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch attendance data." });
  }
};

const getFeeDetails = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    const user = await User.findOne({ where: { username: userKey } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const feeDetails = await FeeDetails.findAll({
      where: {
        paid: false,
        userId: user.id,
      },
    });

    if (feeDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No unpaid fee details found for this user." });
    }

    const filteredFeeDetails = feeDetails.map((fee) => {
      const { id, UserId, ...rest } = fee.get();
      return rest;
    });

    return res.status(200).json(filteredFeeDetails);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getInternalMarks = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    const user = await User.findOne({ where: { username: userKey } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const internalMarks = await InternalMarks.findAll({
      where: { UserId: user.id },
    });

    if (!internalMarks || internalMarks.length === 0) {
      return res
        .status(404)
        .json({ message: "No internal marks found for this user." });
    }

    const markDetails = internalMarks.map((mark) => mark.markDetails).flat();

    return res.status(200).json({
      markDetails,
    });
  } catch (error) {
    console.error("Error fetching internal marks:", error);
    return res.status(500).json({ error: "Failed to fetch internal marks." });
  }
};

module.exports = {
  getStudentProfile,
  getAttendanceData,
  getFeeDetails,
  getInternalMarks,
};
