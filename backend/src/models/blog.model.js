import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Blog = sequelize.define(
  'Blog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200],
        notEmpty: true,
      },
    },
    tagline: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 300],
      },
    },
    imageUrls: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    author: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        id: null,
        name: 'Unknown Author',
        avatarUrl: null,
      },
    },
    index: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.ENUM(
        'reviews',
        'news',
        'comparisons',
        'buying_guide',
        'maintenance',
        'technology',
        'industry_insights',
        'events',
        'lifestyle'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived', 'scheduled'),
      defaultValue: 'draft',
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    carIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOfUUIDs(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('carIds must be an array');
          }
          if (value && value.length > 0) {
            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            const invalidIds = value.filter(
              (id) => typeof id !== 'string' || !uuidRegex.test(id)
            );
            if (invalidIds.length > 0) {
              throw new Error('All carIds must be valid UUIDs');
            }
          }
        },
      },
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 60],
      },
    },
    seoDescription: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 160],
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['publishedAt'],
      },
    ],
  }
);

export default Blog;
