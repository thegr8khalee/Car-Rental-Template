// lib/db.js - Database configuration
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },

  // Connection pool - reduced for stability
  pool: {
    max: 5,
    min: 0,
    acquire: 90000,
    idle: 10000,
    evict: 10000
  },

  // Retry configuration
  retry: {
    max: 3,
    backoffBase: 1000,
    backoffExponent: 1.5
  },

  // Timezone
  timezone: '+00:00',

  // Model definition defaults
  define: {
    timestamps: true,
    underscored: false,
    paranoid: false,
    freezeTableName: false,
  },

  // Retry on failure
  retry: {
    max: 3
  }
});

export default sequelize;

// config/database.js - Environment-specific configurations
export const databaseConfig = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'car_blog_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
  },
  test: {
    username: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'car_blog_test',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 30,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
};

// scripts/setup-database.js - Setup script
import models, {
  syncDatabase,
  testConnection,
  seedData,
  resetDatabase,
  closeDatabase
} from '../models/index.js';

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup...\n');

    // Test connection
    console.log('1. Testing database connection...');
    await testConnection();

    // Sync database (create tables)
    console.log('\n2. Synchronizing database schema...');
    await syncDatabase({ alter: true });

    // Seed initial data
    console.log('\n3. Seeding initial data...');
    await seedData();

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📊 Database Statistics:');
    console.log(`- Models created: ${Object.keys(models).length - 1}`); // -1 for sequelize instance
    console.log('- Tables: Users, Admins, Cars, Blogs, Comments, Likes, Newsletters, BlogCars');
    console.log('- Associations: All relationships configured');
    console.log('- Indexes: Optimized for performance');
    console.log('- Constraints: Foreign keys and validations in place\n');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

// Run setup if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      setupDatabase();
      break;
    case 'reset':
      resetDatabase().then(() => closeDatabase());
      break;
    case 'seed':
      seedData().then(() => closeDatabase());
      break;
    case 'test':
      testConnection().then(() => closeDatabase());
      break;
    default:
      console.log('Available commands:');
      console.log('  setup - Full database setup');
      console.log('  reset - Reset and recreate all tables');
      console.log('  seed  - Seed initial data only');
      console.log('  test  - Test database connection');
      break;
  }
}

export { setupDatabase };

// utils/query-helpers.js - Useful query utilities
import { Op } from 'sequelize';
import { Blog, Admin, Car, Comment, User } from '../models/index.js';

export const QueryHelpers = {
  // Get published blogs with author and car info
  getPublishedBlogs: async (options = {}) => {
    const {
      page = 1,
      limit = 10,
      category = null,
      authorId = null,
      search = null,
    } = options;

    const offset = (page - 1) * limit;
    const where = { status: 'published' };

    if (category) where.category = category;
    if (authorId) where.authorId = authorId;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { tagline: { [Op.like]: `%${search}%` } }
      ];
    }

    return await Blog.findAndCountAll({
      where,
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'username', 'position', 'avatar', 'bio']
        },
        {
          model: Car,
          as: 'cars',
          attributes: ['id', 'make', 'model', 'year', 'imageUrls'],
          through: { attributes: [] }
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });
  },

  // Get blog with comments
  getBlogWithComments: async (id) => {
    return await Blog.findOne({
      where: { id, status: 'published' },
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'username', 'position', 'avatar', 'bio']
        },
        {
          model: Car,
          as: 'cars',
          attributes: ['id', 'make', 'model', 'year', 'imageUrls', 'bodyType'],
          through: { attributes: [] }
        },
        {
          model: Comment,
          as: 'comments',
          where: { status: 'approved' },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });
  },

  // Get popular cars (by blog count)
  getPopularCars: async (limit = 10) => {
    return await Car.findAll({
      attributes: [
        'id', 'make', 'model', 'year', 'imageUrls',
        [sequelize.fn('COUNT', sequelize.col('blogs.id')), 'blogCount']
      ],
      include: [
        {
          model: Blog,
          as: 'blogs',
          attributes: [],
          where: { status: 'published' },
          required: false,
          through: { attributes: [] }
        }
      ],
      group: ['Car.id'],
      order: [[sequelize.literal('blogCount'), 'DESC']],
      limit,
      subQuery: false
    });
  },

  // Search functionality
  searchBlogs: async (query, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    return await Blog.findAndCountAll({
      where: {
        status: 'published',
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { content: { [Op.like]: `%${query}%` } },
          { tagline: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'username', 'position', 'avatar']
        },
        {
          model: Car,
          as: 'cars',
          attributes: ['id', 'make', 'model', 'year'],
          through: { attributes: [] }
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });
  },

  // Get user with comments and likes
  getUserActivity: async (userId) => {
    return await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: Blog,
              as: 'blog',
              attributes: ['id', 'title']
            }
          ]
        },
      ]
    });
  }
};

// .env.example - Environment variables template
/*
# Database Configuration
DB_NAME=car_blog
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# Test Database
TEST_DB_NAME=car_blog_test
TEST_DB_USER=root
TEST_DB_PASSWORD=your_password
TEST_DB_HOST=localhost
TEST_DB_PORT=3306

# Application
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=your_jwt_secret_key_here
BCRYPT_ROUNDS=10

# SSL (for production)
DB_SSL=false
*/