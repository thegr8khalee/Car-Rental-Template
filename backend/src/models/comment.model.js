import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
        notEmpty: true,
      },
    },
    blogId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Blogs',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'spam'),
      defaultValue: 'pending',
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['blogId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Comment