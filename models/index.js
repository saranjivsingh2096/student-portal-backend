const pg = require("pg");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
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
User.hasOne(FeeDetails);
User.hasOne(TransactionLogData);
User.hasOne(InternalMarks);
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
