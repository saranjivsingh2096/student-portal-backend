import pg from 'pg';
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
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

User.hasOne(AttendanceData);
User.hasOne(StudentProfile);
User.hasOne(FeeDetails);
User.hasOne(TransactionLogData);
AttendanceData.belongsTo(User);
StudentProfile.belongsTo(User);
FeeDetails.belongsTo(User);
TransactionLogData.belongsTo(User);

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
};
