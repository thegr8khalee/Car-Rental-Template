import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Newsletter = sequelize.define(
  'Newsletter',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        frequency: 'weekly',
        categories: ['news', 'reviews'],
      },
    },
    unsubscribedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Where the subscriber came from (blog, homepage, etc.)',
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['email'],
      },
    ],
  }
);

export default Newsletter