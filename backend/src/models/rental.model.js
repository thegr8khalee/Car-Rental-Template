import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Rental = sequelize.define(
  'Rental',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    carId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Cars',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('stripe', 'flutterwave', 'paystack'),
      allowNull: true,
    },
    transactionReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default Rental;
