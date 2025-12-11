import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';
// Assuming Admin model is imported like this (adjust path as needed)
// import Admin from './Admin.js'; 

const Broadcast = sequelize.define(
  'Broadcast',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    // Mismatched field in the original model ('title') changed to 'subject'
    subject: { // Changed from 'title' to 'subject' to match your query
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    // New fields to match the statistics queries (Error 2)
    recipientCount: { // Total subscribers the email was attempted to send to
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    successCount: { // Count of successful deliveries
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    failureCount: { // Count of failed/bounced deliveries
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: { // Status of the broadcast (needed for WHERE clause query)
      type: DataTypes.ENUM('draft', 'pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    // Original fields
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    sentById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Admins',
        key: 'id',
      },
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Adding 'createdAt' and 'updatedAt' by setting timestamps to true
    // as your query `SELECT ... 'createdAt'` suggests you expect it.
  },
  {
    timestamps: true, // Changed to true to match the 'createdAt' field requested in the SQL query
    indexes: [
      {
        fields: ['sentById'],
      },
      {
        fields: ['sentAt'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Broadcast;