module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  User.associate = (models) => {
    User.hasOne(models.AttendanceData);
    User.hasOne(models.StudentProfile);
    User.hasOne(models.StudentDetails);
  };

  return User;
};
