const pg = require("pg");
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Enable query performance logging in development
const enableLogging = process.env.NODE_ENV !== 'production';

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  dialectModule: pg,
  logging: enableLogging ? (query, time) => {
    if (time > 500) { // Log slow queries (taking more than 500ms)
      console.log(`SLOW QUERY (${time}ms): ${query}`);
    }
  } : false,
  pool: {
    max: 20,            // Increase maximum connections
    min: 5,             // Increase minimum connections
    acquire: 30000,     // Maximum time to get connection
    idle: 10000         // Maximum idle time
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    // Set statement timeout to prevent long-running queries
    statement_timeout: 10000, // 10 seconds
    // Increase keepalives to maintain connections
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  },
  // Enable query benchmarking
  benchmark: enableLogging,
  // Add retry on database connection failure
  retry: {
    max: 5, // Maximum retry attempts
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/
    ],
    backoffBase: 100, // Initial backoff duration in ms
    backoffExponent: 1.1, // Exponent to increase backoff each time
    report: (message) => console.log(message) // Function to report each retry
  }
});

const User = require("./User")(sequelize, Sequelize.DataTypes);
const AttendanceData = require("./AttendanceData")(
  sequelize,
  Sequelize.DataTypes
);
const StudentProfile = require("./StudentProfile")(
  sequelize,
  Sequelize.DataTypes
);
const FeeDetails = require("./FeeDetails")(sequelize, Sequelize.DataTypes);
const TransactionLogData = require("./TransactionLogData")(
  sequelize,
  Sequelize.DataTypes
);

const InternalMarks = require("./InternalMarks")(
  sequelize,
  Sequelize.DataTypes
);

User.hasOne(AttendanceData);
User.hasOne(StudentProfile);
User.hasMany(FeeDetails);
User.hasMany(TransactionLogData);
User.hasMany(InternalMarks);
AttendanceData.belongsTo(User);
StudentProfile.belongsTo(User);
FeeDetails.belongsTo(User);
TransactionLogData.belongsTo(User);
InternalMarks.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((err) => {
    console.log("Error syncing the database: ", err);
  });

module.exports = {
  sequelize,
  User,
  AttendanceData,
  StudentProfile,
  FeeDetails,
  TransactionLogData,
  InternalMarks,
};
