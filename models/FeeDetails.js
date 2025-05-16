module.exports = (sequelize, DataTypes) => {
  const FeeDetails = sequelize.define(
    "FeeDetails",
    {
      feeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      yearMonth: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      raisedAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lastDateWithoutLateFee: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastDateWithLateFee: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      feeWithLateFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lastDateWithPenalty: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      feeWithPenalty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      paidAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      concessionAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      amountToPay: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      minimumAmountAllowed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      enterAmountToPay: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        index: true,
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          name: 'fee_user_paid_idx',
          fields: ['UserId', 'paid']
        },
        {
          name: 'fee_type_idx',
          fields: ['feeType']
        }
      ]
    }
  );

  FeeDetails.associate = (models) => {
    FeeDetails.belongsTo(models.User);
  };

  return FeeDetails;
};
