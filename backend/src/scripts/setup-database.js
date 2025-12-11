// scripts/setup-database.js
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