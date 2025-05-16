const {
  User,
  StudentProfile,
  AttendanceData,
  FeeDetails,
  InternalMarks,
  sequelize
} = require("../models");
const { getCache, setCache } = require("../utils/cache");

const getStudentProfile = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    // Try to get data from cache first
    const cacheKey = `student-profile:${userKey}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // If no cache, query the database
    const user = await User.findOne({
      where: { username: userKey },
      include: [
        {
          model: StudentProfile,
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.StudentProfile) {
      return res
        .status(404)
        .json({ message: "Profile information not found." });
    }

    const { id, UserId, ...filteredStudentProfile } = user.StudentProfile.toJSON();
    
    // Store in cache before returning
    await setCache(cacheKey, filteredStudentProfile, 3600); // 1 hour TTL
    
    return res.status(200).json(filteredStudentProfile);
  } catch (error) {
    console.error("Error in getStudentProfile:", error);
    return res.status(500).json({ error: "Failed to fetch student profile." });
  }
};

const getAttendanceData = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    // Try to get data from cache first
    const cacheKey = `attendance-data:${userKey}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    console.log("Fetching attendance data for user:", userKey);
    
    // Use eager loading to fetch user and attendance data in one query
    const user = await User.findOne({
      where: { username: userKey },
      include: [
        {
          model: AttendanceData,
          required: false
        }
      ]
    });

    if (!user) {
      console.log("User not found for attendance data:", userKey);
      return res.status(404).json({ message: "User not found." });
    }

    console.log("User found, attendance data:", user.AttendanceData ? "exists" : "missing");

    if (!user.AttendanceData) {
      return res.status(404).json({ message: "Attendance data not found." });
    }

    // Check for necessary properties before accessing them
    if (!user.AttendanceData.courseWiseAttendance || !user.AttendanceData.cumulativeAttendance) {
      console.error("Missing attendance data properties:", user.AttendanceData);
      return res.status(500).json({ message: "Attendance data is malformed." });
    }

    const response = {
      attendancePeriodStartDate: user.AttendanceData.attendancePeriodStartDate,
      attendancePeriodEndDate: user.AttendanceData.attendancePeriodEndDate,
      courseWiseAttendance:
        user.AttendanceData.courseWiseAttendance.courseWiseAttendance || [],
      cumulativeAttendance:
        user.AttendanceData.cumulativeAttendance.cumulativeAttendance || {},
    };

    // Store in cache before returning - attendance data rarely changes, so cache longer
    await setCache(cacheKey, response, 86400); // 24 hours TTL

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAttendanceData:", error);
    return res.status(500).json({ error: "Failed to fetch attendance data." });
  }
};

const getFeeDetails = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    // Try to get data from cache first
    const cacheKey = `fee-details:${userKey}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    console.log("Fetching fee details for user:", userKey);
    
    // Use a join query to get fee details in a single query
    const user = await User.findOne({
      where: { username: userKey }
    });

    if (!user) {
      console.log("User not found for fee details:", userKey);
      return res.status(404).json({ message: "User not found." });
    }

    // Query directly from FeeDetails table to check if there's any data
    console.log("Looking for fee details with UserId:", user.id);
    
    // Debug database structure
    const rawQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'FeeDetails'
    `;
    const columnInfo = await sequelize.query(rawQuery, { type: sequelize.QueryTypes.SELECT });
    console.log("FeeDetails table structure:", columnInfo);
    
    // Optimized query with specific attributes
    const feeDetails = await FeeDetails.findAll({
      where: {
        UserId: user.id,
      },
      attributes: [
        'feeType', 'yearMonth', 'raisedAmount', 'lastDateWithoutLateFee',
        'lastDateWithLateFee', 'feeWithLateFee', 'lastDateWithPenalty',
        'feeWithPenalty', 'paidAmount', 'concessionAmount', 'amountToPay',
        'minimumAmountAllowed', 'enterAmountToPay', 'paid'
      ],
      order: [['yearMonth', 'DESC']]
    });

    console.log(`Found ${feeDetails.length} fee details for user ${userKey}`);

    if (feeDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No fee details found for this user." });
    }

    // Filter for unpaid only if needed
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
    
    // Fees may change, so use shorter cache time
    await setCache(cacheKey, response, 3600); // 1 hour TTL
    
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getFeeDetails:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getInternalMarks = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    // Try to get data from cache first
    const cacheKey = `internal-marks:${userKey}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    console.log("Fetching internal marks for user:", userKey);
    
    // Use a join query to get user and internal marks in a single query
    const user = await User.findOne({
      where: { username: userKey }
    });

    if (!user) {
      console.log("User not found for internal marks:", userKey);
      return res.status(404).json({ message: "User not found." });
    }

    // Query directly from InternalMarks table
    console.log("Looking for internal marks with UserId:", user.id);
    const internalMarks = await InternalMarks.findAll({
      where: { UserId: user.id }
    });

    console.log(`Found ${internalMarks.length} internal marks entries for user ${userKey}`);

    if (!internalMarks || internalMarks.length === 0) {
      return res
        .status(404)
        .json({ message: "No internal marks found for this user." });
    }

    try {
      const markDetails = internalMarks.map(mark => {
        if (!mark.markDetails) {
          console.error("Mark details missing for record:", mark.id);
          return [];
        }
        return mark.markDetails;
      }).flat();

      // Process and organize marks data for faster client rendering
      const response = {
        markDetails,
        summary: {
          totalCourses: new Set(markDetails.map(mark => mark.courseCode)).size,
          totalAssessments: markDetails.length
        }
      };

      // Marks don't change often, so we can cache longer
      await setCache(cacheKey, response, 86400); // 24 hours TTL
      
      return res.status(200).json(response);
    } catch (parseError) {
      console.error("Error processing mark details:", parseError);
      return res.status(500).json({ error: "Failed to process internal marks data." });
    }
  } catch (error) {
    console.error("Error in getInternalMarks:", error);
    return res.status(500).json({ error: "Failed to fetch internal marks." });
  }
};

// New method to fetch all student data in one request for dashboard
const getDashboardData = async (req, res) => {
  const userKey = req.query.user;

  if (!userKey) {
    return res.status(400).json({ message: "User key is missing." });
  }

  try {
    // Try to get dashboard data from cache first
    const cacheKey = `dashboard:${userKey}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    console.log("Fetching dashboard data for user:", userKey);
    
    // Get user with all related data in a single query
    const user = await User.findOne({
      where: { username: userKey },
      include: [
        { model: StudentProfile, required: false },
        { model: AttendanceData, required: false }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prepare basic user data
    const dashboardData = {
      username: user.username,
      profile: user.StudentProfile ? {
        name: user.StudentProfile.name,
        registerNumber: user.StudentProfile.registerNumber,
        branch: user.StudentProfile.branch,
        semester: user.StudentProfile.semester,
        section: user.StudentProfile.section
      } : null,
      attendance: user.AttendanceData ? {
        cumulativePercentage: user.AttendanceData.cumulativeAttendance?.cumulativeAttendance?.percentage || "N/A"
      } : null
    };

    // Get fee summary
    const feeDetails = await FeeDetails.findAll({
      where: { UserId: user.id, paid: false },
      attributes: ['amountToPay']
    });
    
    dashboardData.fees = {
      pendingAmount: feeDetails.reduce((sum, fee) => sum + fee.amountToPay, 0),
      pendingCount: feeDetails.length
    };

    // Get marks summary
    const marksCount = await InternalMarks.count({
      where: { UserId: user.id }
    });
    
    dashboardData.marks = {
      availableAssessments: marksCount
    };

    // Store dashboard data in cache (short TTL since it aggregates multiple data sources)
    await setCache(cacheKey, dashboardData, 1800); // 30 minutes TTL
    
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

module.exports = {
  getStudentProfile,
  getAttendanceData,
  getFeeDetails,
  getInternalMarks,
  getDashboardData
};
