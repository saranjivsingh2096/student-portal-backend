module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        index: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          name: 'username_idx',
          unique: true,
          fields: ['username']
        }
      ]
    }
  );

  User.associate = (models) => {
    User.hasOne(models.AttendanceData);
    User.hasOne(models.StudentProfile);
    User.hasOne(models.StudentDetails);
  };

  return User;
};
