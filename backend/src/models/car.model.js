import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Car = sequelize.define(
  'Car',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50],
        notEmpty: true,
      },
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 2,
      },
    },
    bodyType: {
      type: DataTypes.ENUM(
        'sedan',
        'coupe',
        'hatchback',
        'suv',
        'crossover',
        'truck',
        'convertible',
        'wagon',
        'minivan',
        'sports_car',
        'luxury',
        'electric',
        'hybrid'
      ),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        'luxury',
        'comfort',
        'sport',
        'suv',
        'budget',
        'pickup',
        'ev'
      ),
      allowNull: false,
      defaultValue: 'budget',
    },
    fuelType: {
      type: DataTypes.ENUM(
        'gasoline',
        'diesel',
        'electric',
        'hybrid',
        'hydrogen'
      ),
      allowNull: true,
    },
    condition: {
      type: DataTypes.ENUM('new', 'used', 'clean', 'accident free'),
      allowNull: true,
    },
    transmission: {
      type: DataTypes.ENUM('manual', 'automatic', 'cvt', 'dual_clutch'),
      allowNull: true,
    },
    engineSize: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
    },
    horsepower: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    torque: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drivetrain: {
      type: DataTypes.ENUM('fwd', 'rwd', 'awd', '4wd'),
      allowNull: true,
    },
    msrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    dailyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'rented', 'maintenance'),
      defaultValue: 'available',
    },
    mileage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrls: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      // validate: {
      //   isArrayOfStrings(value) {
      //     if (value && !Array.isArray(value)) {
      //       throw new Error('imageUrls must be an array');
      //     }
      //     if (value && value.some((url) => typeof url !== 'string')) {
      //       throw new Error('All imageUrls must be strings');
      //     }
      //   },
      // },
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sold: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    interior: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOfStrings(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('interior must be an array');
          }
          if (value && value.some((url) => typeof url !== 'string')) {
            throw new Error('All interior must be strings');
          }
        },
      },
    },
    exterior: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOfStrings(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('exterior must be an array');
          }
          if (value && value.some((url) => typeof url !== 'string')) {
            throw new Error('All exterior must be strings');
          }
        },
      },
    },
    comfort: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOfStrings(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('comfort must be an array');
          }
          if (value && value.some((url) => typeof url !== 'string')) {
            throw new Error('All comfort must be strings');
          }
        },
      },
    },
    safety: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOfStrings(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('safety must be an array');
          }
          if (value && value.some((url) => typeof url !== 'string')) {
            throw new Error('All safety must be strings');
          }
        },
      },
    },
    // New fields
    door: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 6,
      },
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 50],
      },
    },
    cylinder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 16,
      },
    },
    length: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Length in inches',
    },
    width: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Width in inches',
    },
    trunkCapacity: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'Trunk capacity in cubic feet',
    },
    tireSize: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 20],
      },
    },
    zeroToHundred: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'Time in seconds to accelerate from 0 to 100km/h',
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['make'],
      },
      {
        fields: ['model'],
      },
      {
        fields: ['year'],
      },
      {
        fields: ['bodyType'],
      },
      {
        fields: ['category'],
      },
    ],
  }
);

export default Car;
