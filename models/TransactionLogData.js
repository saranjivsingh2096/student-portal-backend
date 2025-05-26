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
        type: DataTypes.DATE,
        allowNull: false,
      },
      paymentGateway: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      updatedAt: 'transactionUpdatedAt',
      createdAt: 'transactionCreatedAt',
      indexes: [
        {
          name: 'transaction_user_idx',
          fields: ['UserId']
        },
        {
          name: 'transaction_id_idx',
          fields: ['srmTransactionId'],
          unique: true
        },
        {
          name: 'transaction_date_idx',
          fields: ['transactionDate']
        }
      ]
    }
  );

  TransactionLogData.associate = (models) => {
    TransactionLogData.belongsTo(models.User);
  };

  return TransactionLogData;
};
