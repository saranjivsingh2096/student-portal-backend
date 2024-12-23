module.exports = (sequelize, DataTypes) => {
  const StudentProfile = sequelize.define(
    "StudentProfile",
    {
      studentName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      registerNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      institution: {
        type: DataTypes.STRING,
      },
      program: {
        type: DataTypes.STRING,
      },
      photoUrl: {
        type: DataTypes.STRING,
      },
      batch: {
        type: DataTypes.STRING,
      },
      semester: {
        type: DataTypes.STRING,
      },
      section: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      dob: {
        type: DataTypes.DATEONLY,
      },
      gender: {
        type: DataTypes.STRING,
      },
      nationality: {
        type: DataTypes.STRING,
      },
      bloodGroup: {
        type: DataTypes.STRING,
      },
      fatherName: {
        type: DataTypes.STRING,
      },
      motherName: {
        type: DataTypes.STRING,
      },
      parentContact: {
        type: DataTypes.STRING,
      },
      parentEmail: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      pincode: {
        type: DataTypes.STRING,
      },
      district: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      personalEmail: {
        type: DataTypes.STRING,
      },
      studentMobile: {
        type: DataTypes.STRING,
      },
      alternativeStudentMobile: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );

  StudentProfile.associate = (models) => {
    StudentProfile.belongsTo(models.User);
  };

  return StudentProfile;
};
