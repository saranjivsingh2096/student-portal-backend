module.exports = (sequelize, DataTypes) => {
  const InternalMarks = sequelize.define(
    "InternalMarks",
    {
      markDetails: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  InternalMarks.associate = (models) => {
    InternalMarks.belongsTo(models.User);
  };

  return InternalMarks;
};
