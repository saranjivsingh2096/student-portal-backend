module.exports = (sequelize, DataTypes) => {
  const GradeDetails = sequelize.define(
    "GradeDetails",
    {
      gradeDetails: {
        type: DataTypes.JSONB, 
        allowNull: false,
      },
    },
    {
      timestamps: false, 
    }
  );

  GradeDetails.associate = (models) => {
    GradeDetails.belongsTo(models.User);
  };

  return GradeDetails;
}; 