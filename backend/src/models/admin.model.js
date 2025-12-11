import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'editor', 'moderator'),
      defaultValue: 'editor',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['email'],
      },
      {
        fields: ['username'],
      },
      {
        fields: ['role'],
      },
    ],
  }
);

export default Admin;