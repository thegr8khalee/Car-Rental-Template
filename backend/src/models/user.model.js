import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Automatically generates a UUID v4
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 30],
        notEmpty: true,
      },
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
    // passwordHash removed - handled by Supabase
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[\+]?[0-9]{10,15}$/,   
      },
    },
    // passwordReset fields removed - handled by Supabase
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['email'],
      }
    ],
  }
);

export default User;
