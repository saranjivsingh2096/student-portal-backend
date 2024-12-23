module.exports = (sequelize, DataTypes) => {
  const TransactionLogData = sequelize.define(
    "TransactionLogData",
    {
      studentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      srmTransactionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankTransactionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentGateway: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  TransactionLogData.associate = (models) => {
    TransactionLogData.belongsTo(models.User);
  };

  return TransactionLogData;
};
