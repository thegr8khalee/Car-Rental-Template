// models/associations.js
import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';
import User from './user.model.js';
import Admin from './admin.model.js';
import Car from './car.model.js';
import Blog from './blog.model.js';
import Comment from './comment.model.js';
import Newsletter from './news.model.js';
import Review from './review.model.js';
import Broadcast from './broadcast.model.js';
import Rental from './rental.model.js';

Admin.hasMany(Broadcast, {
  foreignKey: 'sentById',
  as: 'broadcastsSent',
});

Broadcast.belongsTo(Admin, {
  foreignKey: 'sentById',
  as: 'sender',
});

// Blog associations - Changed alias from 'author' to 'adminAuthor'
Blog.belongsTo(Admin, {
  foreignKey: 'authorId',
  as: 'adminAuthor', // Changed from 'author' to avoid collision
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Admin.hasMany(Blog, {
  foreignKey: 'authorId',
  as: 'blogs',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Many-to-Many association between Blog and Car (using carIds array)
const BlogCar = sequelize.define(
  'BlogCar',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blogId: {
      type: DataTypes.UUID,
      references: {
        model: 'Blogs',
        key: 'id',
      },
    },
    carId: {
      type: DataTypes.UUID,
      references: {
        model: 'Cars',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['blogId', 'carId'],
      },
    ],
  }
);

Blog.belongsToMany(Car, {
  through: BlogCar,
  foreignKey: 'blogId',
  otherKey: 'carId',
  as: 'cars',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Car.belongsToMany(Blog, {
  through: BlogCar,
  foreignKey: 'carId',
  otherKey: 'blogId',
  as: 'blogs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Comment associations
Comment.belongsTo(Blog, {
  foreignKey: 'blogId',
  as: 'blog',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Blog.hasMany(Comment, {
  foreignKey: 'blogId',
  as: 'comments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Car and Review associations
Car.hasMany(Review, {
  foreignKey: 'carId',
  as: 'reviews', // This alias allows us to include reviews when querying a Car
  onDelete: 'CASCADE', // Optional: if a Car is deleted, all its Reviews are also deleted
});

// A Review belongs to a Car
Review.belongsTo(Car, {
  foreignKey: 'carId',
  as: 'car', // This alias allows us to include the car when querying a Review
});

// User and Review associations (added for dashboard functionality)
User.hasMany(Review, {
  foreignKey: 'userId',
  as: 'reviews',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Review.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Additional associations for dashboard analytics

// Admin activity tracking associations (if you want to track which admin created what)
Admin.hasMany(Car, {
  foreignKey: 'createdBy', // You might want to add this field to Car model
  as: 'createdCars',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Newsletter associations (if you want to track subscription sources)
// Newsletter doesn't need direct associations since it's standalone

// Rental Associations
User.hasMany(Rental, { foreignKey: 'userId', as: 'rentals' });
Rental.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Car.hasMany(Rental, { foreignKey: 'carId', as: 'rentals' });
Rental.belongsTo(Car, { foreignKey: 'carId', as: 'car' });

// Export all models and the junction table
export { User, Admin, Car, Blog, Comment, Newsletter, Review, BlogCar, Rental };

// Export a function to initialize all associations
export const initializeAssociations = () => {
  console.log('All model associations have been initialized');

  // Log association summary for debugging
  console.log('Association Summary:');
  console.log('- Admin hasMany Blogs, Blogs belongsTo Admin');
  console.log('- Blog belongsToMany Car through BlogCar');
  console.log('- Blog hasMany Comments, Comment belongsTo Blog');
  console.log('- User hasMany Comments, Comment belongsTo User');
  console.log('- Car hasMany Reviews, Review belongsTo Car');
  console.log('- User hasMany Reviews, Review belongsTo User');
  console.log('- Admin hasMany Cars (for tracking creator)');
};

// Export models with their associations for easy access
export const Models = {
  User,
  Admin,
  Car,
  Blog,
  Comment,
  Newsletter,
  Review,
  BlogCar,
  Rental,
};

export default {
  User,
  Admin,
  Car,
  Blog,
  Comment,
  Newsletter,
  Review,
  BlogCar,
  Rental,
  initializeAssociations,
  Models,
};
