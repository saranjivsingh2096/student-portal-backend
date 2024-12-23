module.exports = (sequelize, DataTypes) => {
  const AttendanceData = sequelize.define(
    "AttendanceData",
    {
      attendancePeriodStartDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      attendancePeriodEndDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      courseWiseAttendance: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      cumulativeAttendance: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  AttendanceData.associate = (models) => {
    AttendanceData.belongsTo(models.User);
  };

  return AttendanceData;
};
