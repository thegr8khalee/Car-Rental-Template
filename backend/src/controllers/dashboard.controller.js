import Car from '../models/car.model.js';
import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';
import Review from '../models/review.model.js';
import Newsletter from '../models/news.model.js';
import { Op, fn, col, literal, Sequelize } from 'sequelize';
import {
  calculateDateRanges,
  formatCurrency,
  calculatePercentageChange,
} from '../lib/dashboard.utils.js';
import Admin from '../models/admin.model.js';
import SellNow from '../models/sell.model.js';

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get comments - no include needed if you don't need blog details
    const comments = await Comment.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // Get reviews - no include needed if you don't need car details
    const reviews = await Review.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // Get newsletter subscription
    const newsletter = await Newsletter.findOne({
      where: { email: user.email },
    });

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        comments,
        reviews,
        newsletter,
      },
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: error.message });
  }
};

// Main dashboard overview stats
export const getDashboardStats = async (req, res) => {
  try {
    const { thisMonth, lastMonth, thisYear, lastYear } = calculateDateRanges();

    // Car inventory stats
    const totalCars = await Car.count();
    const soldCars = await Car.count({ where: { sold: true } });
    const availableCars = totalCars - soldCars;
    const carsAddedThisMonth = await Car.count({
      where: { createdAt: { [Op.gte]: thisMonth.start } },
    });
    const carsAddedLastMonth = await Car.count({
      where: { createdAt: { [Op.gte]: lastMonth.start } },
    });
    const inventoryRate = ((availableCars / totalCars) * 100).toFixed(1);
    const soldThisMonth = await Car.count({
      where: { createdAt: { [Op.gte]: thisMonth.start }, sold: true },
    });
    const soldLastMonth = await Car.count({
      where: { createdAt: { [Op.gte]: lastMonth.start }, sold: true },
    });
    const salesChange = calculatePercentageChange(soldThisMonth, soldLastMonth);

    //selling to us stats
    const sellingToUsThisYear = await SellNow.count({
      where: { createdAt: { [Op.gte]: thisYear.start } },
    });
    const sellingToUsLastYear = await SellNow.count({
      where: { createdAt: { [Op.gte]: lastYear.start } },
    });
    const sellingToUsLastMonth = await SellNow.count({
      where: { createdAt: { [Op.gte]: lastMonth.start } },
    });
    const sellingToUsThisMonth = await SellNow.count({
      where: { createdAt: { [Op.gte]: thisMonth.start } },
    });
    const sellingToUsChange = calculatePercentageChange(
      sellingToUsThisMonth,
      sellingToUsLastMonth
    );
    const sellingToUsYearlyChange = calculatePercentageChange(
      sellingToUsThisYear,
      sellingToUsLastYear
    );
    const sellingToUsTotal = await SellNow.count();
    const SellingToUsPending = await SellNow.count({
      where: { OfferStatus: 'Pending' },
    });
    const SellingToUsOfferSent = await SellNow.count({
      where: { OfferStatus: 'Offer Sent' },
    });
    const SellingToUsAccepted = await SellNow.count({
      where: { OfferStatus: 'Accepted' },
    });
    const SellingToUsRejected = await SellNow.count({
      where: { OfferStatus: 'Rejected' },
    });

    // Blog stats
    const totalBlogs = await Blog.count();
    const publishedBlogs = await Blog.count({ where: { status: 'published' } });
    const draftBlogs = await Blog.count({ where: { status: 'draft' } });
    const totalViews = (await Blog.sum('viewCount')) || 0;

    // User engagement stats
    const totalUsers = await User.count();
    const totalComments = await Comment.count();
    const pendingComments = await Comment.count({
      where: { status: 'pending' },
    });
    const totalReviews = await Review.count();
    const pendingReviews = await Review.count({ where: { status: 'pending' } });

    // Newsletter stats
    const newsletterSubscribers = await Newsletter.count({
      where: { unsubscribedAt: null },
    });

    // Revenue calculation (only for super_admin)
    let revenueStats = null;
    if (req.admin.role === 'super_admin') {
      const totalRevenue =
        (await Car.sum('price', { where: { sold: true } })) || 0;
      const monthlyRevenue =
        (await Car.sum('price', {
          where: {
            sold: true,
            updatedAt: { [Op.gte]: thisMonth.start },
          },
        })) || 0;

      revenueStats = {
        totalRevenue: formatCurrency(totalRevenue),
        monthlyRevenue: formatCurrency(monthlyRevenue),
        averageCarPrice: formatCurrency(totalRevenue / (soldCars || 1)),
      };
    }

    // Recent activity counts
    const recentActivity = {
      newUsersThisMonth: await User.count({
        where: { createdAt: { [Op.gte]: thisMonth.start } },
      }),
      newCommentsThisWeek: await Comment.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      newReviewsThisWeek: await Review.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    };

    res.status(200).json({
      success: true,
      data: {
        cars: {
          total: totalCars,
          available: availableCars,
          sold: soldCars,
          addedThisMonth: carsAddedThisMonth,
          inventoryRate: ((availableCars / totalCars) * 100).toFixed(1),
          soldThisMonth,
          soldLastMonth,
          salesChange,
        },
        sellingToUs: {
          thisYear: sellingToUsThisYear,
          lastYear: sellingToUsLastYear,
          thisMonth: sellingToUsThisMonth,
          lastMonth: sellingToUsLastMonth,
          change: sellingToUsChange,
          yearlyChange: sellingToUsYearlyChange,
          total: sellingToUsTotal,
          pending: SellingToUsPending,
          offerSent: SellingToUsOfferSent,
          accepted: SellingToUsAccepted,
          rejected: SellingToUsRejected,
        },
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
          drafts: draftBlogs,
          totalViews: totalViews,
          averageViews: (totalViews / (publishedBlogs || 1)).toFixed(0),
        },
        users: {
          total: totalUsers,
          newThisMonth: recentActivity.newUsersThisMonth,
        },
        engagement: {
          totalComments,
          pendingComments,
          totalReviews,
          pendingReviews,
          newsletterSubscribers,
        },
        recentActivity,
        ...(revenueStats && { revenue: revenueStats }),
      },
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
};

// Detailed car statistics
export const getCarStats = async (req, res) => {
  try {
    const { thisMonth, lastMonth } = calculateDateRanges();

    // Car counts by category
    const carsByBodyType = await Car.findAll({
      attributes: [
        'bodyType',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('price')), 'averagePrice'],
      ],
      where: { bodyType: { [Op.not]: null } },
      group: ['bodyType'],
      order: [[fn('COUNT', col('id')), 'DESC']],
    });

    const carsByCategory = await Car.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('price')), 'averagePrice'],
      ],
      where: { category: { [Op.not]: null } },
      group: ['category'],
      order: [[fn('COUNT', col('id')), 'DESC']],
    });

    // Cars by make
    const carsByMake = await Car.findAll({
      attributes: [
        'make',
        [fn('COUNT', col('id')), 'count'],
        [
          fn('SUM', literal('CASE WHEN sold = true THEN 1 ELSE 0 END')),
          'soldCount',
        ],
      ],
      group: ['make'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
    });

    // Monthly trends
    const thisMonthCars = await Car.count({
      where: { createdAt: { [Op.gte]: thisMonth.start } },
    });
    const lastMonthCars = await Car.count({
      where: {
        createdAt: {
          [Op.between]: [lastMonth.start, lastMonth.end],
        },
      },
    });

    // Price range distribution
    const priceRanges = await Car.findAll({
      attributes: [
        [
          literal(`
          CASE 
            WHEN price < 20000 THEN 'Under $20K'
            WHEN price BETWEEN 20000 AND 40000 THEN '$20K-$40K'
            WHEN price BETWEEN 40000 AND 60000 THEN '$40K-$60K'
            WHEN price BETWEEN 60000 AND 80000 THEN '$60K-$80K'
            ELSE 'Over $80K'
          END
        `),
          'priceRange',
        ],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { price: { [Op.not]: null } },
      group: [
        literal(`
        CASE 
          WHEN price < 20000 THEN 'Under $20K'
          WHEN price BETWEEN 20000 AND 40000 THEN '$20K-$40K'
          WHEN price BETWEEN 40000 AND 60000 THEN '$40K-$60K'
          WHEN price BETWEEN 60000 AND 80000 THEN '$60K-$80K'
          ELSE 'Over $80K'
        END
      `),
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        byBodyType: carsByBodyType,
  byCategory: carsByCategory,
        byMake: carsByMake,
        priceDistribution: priceRanges,
        monthlyTrend: {
          thisMonth: thisMonthCars,
          lastMonth: lastMonthCars,
          change: calculatePercentageChange(lastMonthCars, thisMonthCars),
        },
      },
    });
  } catch (error) {
    console.error('Error in getCarStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching car statistics',
      error: error.message,
    });
  }
};

// Blog performance statistics
export const getBlogStats = async (req, res) => {
  try {
    const { thisMonth, lastMonth } = calculateDateRanges();

    // Blog stats by category
    const blogsByCategory = await Blog.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('viewCount')), 'totalViews'],
      ],
      where: { status: 'published' },
      group: ['category'],
      order: [[fn('SUM', col('viewCount')), 'DESC']],
    });

    // Monthly blog performance
    const thisMonthBlogs = await Blog.count({
      where: {
        publishedAt: { [Op.gte]: thisMonth.start },
        status: 'published',
      },
    });

    const lastMonthBlogs = await Blog.count({
      where: {
        publishedAt: { [Op.between]: [lastMonth.start, lastMonth.end] },
        status: 'published',
      },
    });

    // Top performing blogs
    const topBlogs = await Blog.findAll({
      attributes: ['id', 'title', 'viewCount', 'category', 'publishedAt'],
      where: { status: 'published' },
      order: [['viewCount', 'DESC']],
      limit: 10,
    });

    // Blog status breakdown
    const blogStatusCount = await Blog.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });

    res.status(200).json({
      success: true,
      data: {
        byCategory: blogsByCategory,
        topPerforming: topBlogs,
        statusBreakdown: blogStatusCount,
        monthlyTrend: {
          thisMonth: thisMonthBlogs,
          lastMonth: lastMonthBlogs,
          change: calculatePercentageChange(lastMonthBlogs, thisMonthBlogs),
        },
      },
    });
  } catch (error) {
    console.error('Error in getBlogStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog statistics',
      error: error.message,
    });
  }
};

// User statistics (Super Admin only)
export const getUserStats = async (req, res) => {
  try {
    const { thisMonth, lastMonth } = calculateDateRanges();

    // User registration trends
    const userGrowth = await User.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'newUsers'],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
    });

    // Active users (users who commented or reviewed in last 30 days)
    const activeUsers = await User.count({
      include: [
        {
          model: Comment,
          required: true,
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      ],
    });

    const thisMonthUsers = await User.count({
      where: { createdAt: { [Op.gte]: thisMonth.start } },
    });

    const lastMonthUsers = await User.count({
      where: {
        createdAt: { [Op.between]: [lastMonth.start, lastMonth.end] },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        registrationTrend: userGrowth,
        activeUsers,
        monthlyGrowth: {
          thisMonth: thisMonthUsers,
          lastMonth: lastMonthUsers,
          change: calculatePercentageChange(lastMonthUsers, thisMonthUsers),
        },
      },
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message,
    });
  }
};

// Content moderation statistics
export const getContentModerationStats = async (req, res) => {
  try {
    // Comment moderation stats
    const commentStats = await Comment.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });

    // Review moderation stats
    const reviewStats = await Review.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });

    // Recent comments needing moderation
    const pendingComments = await Comment.findAll({
      attributes: ['id', 'content', 'username', 'createdAt', 'blogId'],
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    // Recent reviews needing moderation
    const pendingReviews = await Review.findAll({
      attributes: ['id', 'content', 'name', 'createdAt', 'carId'],
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.status(200).json({
      success: true,
      data: {
        comments: {
          statusBreakdown: commentStats,
          pendingItems: pendingComments,
        },
        reviews: {
          statusBreakdown: reviewStats,
          pendingItems: pendingReviews,
        },
      },
    });
  } catch (error) {
    console.error('Error in getContentModerationStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content moderation statistics',
      error: error.message,
    });
  }
};

// Revenue statistics (Super Admin only)
export const getRevenueStats = async (req, res) => {
  try {
    // Monthly revenue trend
    const monthlyRevenue = await Car.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('updatedAt'), '%Y-%m'), 'month'],
        [fn('SUM', col('price')), 'revenue'],
        [fn('COUNT', col('id')), 'carsSold'],
      ],
      where: {
        sold: true,
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
        },
      },
      group: [fn('DATE_FORMAT', col('updatedAt'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('updatedAt'), '%Y-%m'), 'ASC']],
    });

    // Revenue by car make
    const revenueByMake = await Car.findAll({
      attributes: [
        'make',
        [fn('SUM', col('price')), 'revenue'],
        [fn('COUNT', col('id')), 'unitsSold'],
        [fn('AVG', col('price')), 'averagePrice'],
      ],
      where: { sold: true },
      group: ['make'],
      order: [[fn('SUM', col('price')), 'DESC']],
      limit: 10,
    });

    // Overall revenue metrics
    const totalRevenue =
      (await Car.sum('price', { where: { sold: true } })) || 0;
    const totalSoldCars = await Car.count({ where: { sold: true } });
    const averageCarPrice =
      totalSoldCars > 0 ? totalRevenue / totalSoldCars : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRevenue: formatCurrency(totalRevenue),
          totalCarsSold: totalSoldCars,
          averageCarPrice: formatCurrency(averageCarPrice),
        },
        monthlyTrend: monthlyRevenue.map((item) => ({
          month: item.dataValues.month,
          revenue: formatCurrency(item.dataValues.revenue),
          carsSold: item.dataValues.carsSold,
        })),
        byMake: revenueByMake.map((item) => ({
          make: item.dataValues.make,
          revenue: formatCurrency(item.dataValues.revenue),
          unitsSold: item.dataValues.unitsSold,
          averagePrice: formatCurrency(item.dataValues.averagePrice),
        })),
      },
    });
  } catch (error) {
    console.error('Error in getRevenueStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue statistics',
      error: error.message,
    });
  }
};

// Recent activity feed
export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Recent cars added
    const recentCars = await Car.findAll({
      attributes: ['id', 'make', 'model', 'year', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Recent blogs published
    const recentBlogs = await Blog.findAll({
      attributes: ['id', 'title', 'category', 'publishedAt'],
      where: { status: 'published' },
      order: [['publishedAt', 'DESC']],
      limit: 5,
    });

    // Recent comments
    const recentComments = await Comment.findAll({
      attributes: ['id', 'content', 'username', 'createdAt', 'status'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Recent reviews
    const recentReviews = await Review.findAll({
      attributes: ['id', 'content', 'name', 'createdAt', 'status'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        recentCars,
        recentBlogs,
        recentComments,
        recentReviews,
      },
    });
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message,
    });
  }
};

// Top performers (cars, blogs, etc.)
export const getTopPerformers = async (req, res) => {
  try {
    // Most viewed blogs
    const topBlogs = await Blog.findAll({
      attributes: ['id', 'title', 'viewCount', 'category', 'publishedAt'],
      where: { status: 'published' },
      order: [['viewCount', 'DESC']],
      limit: 10,
    });

    // Most reviewed cars
    const topReviewedCars = await Car.findAll({
      attributes: [
        'id',
        'make',
        'model',
        'year',
        [fn('COUNT', col('Reviews.id')), 'reviewCount'],
      ],
      include: [
        {
          model: Review,
          attributes: [],
          where: { status: 'approved' },
          required: true,
        },
      ],
      group: ['Car.id'],
      order: [[fn('COUNT', col('Reviews.id')), 'DESC']],
      limit: 10,
    });

    // Best selling car makes
    const topSellingMakes = await Car.findAll({
      attributes: [
        'make',
        [fn('COUNT', col('id')), 'soldCount'],
        [fn('SUM', col('price')), 'totalRevenue'],
      ],
      where: { sold: true },
      group: ['make'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        topBlogs,
        topReviewedCars,
        topSellingMakes: topSellingMakes.map((item) => ({
          make: item.dataValues.make,
          soldCount: item.dataValues.soldCount,
          totalRevenue: formatCurrency(item.dataValues.totalRevenue || 0),
        })),
      },
    });
  } catch (error) {
    console.error('Error in getTopPerformers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top performers',
      error: error.message,
    });
  }
};

export const getListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    // Dynamically build the where clause based on query parameters
    const where = {};
    if (req.query.make) where.make = req.query.make;
    if (req.query.year) where.year = parseInt(req.query.year, 10);
    if (req.query.bodyType) where.bodyType = req.query.bodyType;
    if (req.query.fuelType) where.fuelType = req.query.fuelType;
    if (req.query.transmission) where.transmission = req.query.transmission;
    if (req.query.engineSize)
      where.engineSize = parseFloat(req.query.engineSize);
    if (req.query.drivetrain) where.drivetrain = req.query.drivetrain;
    if (req.query.condition) where.condition = req.query.condition;
    if (req.query.sold) where.sold = req.query.sold === 'true';

    // Handle price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) {
        where.price[Op.gte] = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        where.price[Op.lte] = parseFloat(req.query.maxPrice);
      }
    }

    // Use findAndCountAll to get both the data and the total count for pagination
    const { count, rows: cars } = await Car.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']], // Order by most recent listings
      // Include the associated reviews and calculate the average rating
      include: [
        {
          model: Review,
          as: 'reviews',
          attributes: [
            // Use Sequelize literal to compute the average rating
            [
              fn(
                'AVG',
                literal(
                  '(interiorRating + exteriorRating + comfortRating + performanceRating) / 4'
                )
              ),
              'averageRating',
            ],
            [fn('COUNT', col('reviews.id')), 'reviewCount'],
          ],
        },
      ],
      group: ['Car.id', 'reviews.id'], // Group by Car ID to get one entry per car
      subQuery: false,
    });

    // Process the results to structure the data properly
    const processedCars = cars.map((car) => {
      // The aggregated values are in the included `reviews` object
      const reviewData = car.reviews[0];
      return {
        ...car.toJSON(),
        averageRating: reviewData?.dataValues.averageRating
          ? parseFloat(reviewData.dataValues.averageRating).toFixed(2)
          : null,
        reviewCount: reviewData?.dataValues.reviewCount || 0,
      };
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      listings: processedCars,
    });
  } catch (error) {
    console.error('Error in getListings controller:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error while retrieving listings.' });
  }
};

export const getStaffs = async (req, res) => {
  try {
    // 1. Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 2. Fetch data from the database with pagination
    const { count, rows: staffs } = await Admin.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']], // Optionally order by creation date
      // Optional: Exclude sensitive fields like passwordHash from the response
      attributes: { exclude: ['passwordHash'] },
    });

    // 3. Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 4. Send the paginated response
    return res.status(200).json({
      status: 'success',
      data: {
        staffs,
        pagination: {
          totalStaffs: count,
          currentPage: page,
          limit: limit,
          totalPages: totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching staffs:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve staff data.',
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    // 1. Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Optional: Search/filter parameters
    const { search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    // 2. Build where clause for search
    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // 3. Fetch data from the database with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: limit,
      offset: offset,
      order: [[sortBy, sortOrder]],
      attributes: { exclude: ['passwordHash', 'passwordResetToken'] },
    });

    // 4. Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 5. Send the paginated response
    return res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          totalUsers: count,
          currentPage: page,
          limit: limit,
          totalPages: totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user data.',
      error: error.message,
    });
  }
};

export const getCommentsStats = async (req, res) => {
  try {
    const totalComments = await Comment.count();

    const pendingComments = await Comment.count({
      where: { status: 'pending' },
    });

    const approvedComments = await Comment.count({
      where: { status: 'approved' },
    });

    const rejectedComments = await Comment.count({
      where: { status: 'rejected' },
    });

    const spamComments = await Comment.count({
      where: { status: 'spam' },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        totalComments,
        pendingComments,
        approvedComments,
        rejectedComments,
        spamComments,
      },
    });
  } catch (error) {
    console.error('Error fetching comments stats:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch comments statistics',
      error: error.message,
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, blogId } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (blogId) {
      where.blogId = blogId;
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Blog,
          as: 'blog',
          attributes: ['id', 'title'],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      status: 'success',
      data: {
        comments,
        pagination: {
          total: count,
          currentPage: page,
          totalPages,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch comments',
      error: error.message,
    });
  }
};

export const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'spam'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value',
      });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found',
      });
    }

    await comment.update({ status });

    return res.status(200).json({
      status: 'success',
      message: 'Comment status updated successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Error updating comment status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update comment status',
      error: error.message,
    });
  }
};

export const getReviewsStats = async (req, res) => {
  try {
    const totalReviews = await Review.count();

    const pendingReviews = await Review.count({
      where: { status: 'pending' },
    });

    const approvedReviews = await Review.count({
      where: { status: 'approved' },
    });

    const rejectedReviews = await Review.count({
      where: { status: 'rejected' },
    });

    const spamReviews = await Review.count({
      where: { status: 'spam' },
    });

    // Calculate average ratings
    const avgRatings = await Review.findOne({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('interiorRating')), 'avgInterior'],
        [Sequelize.fn('AVG', Sequelize.col('exteriorRating')), 'avgExterior'],
        [Sequelize.fn('AVG', Sequelize.col('comfortRating')), 'avgComfort'],
        [Sequelize.fn('AVG', Sequelize.col('performanceRating')), 'avgPerformance'],
      ],
      where: { status: 'approved' },
      raw: true,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        totalReviews,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        spamReviews,
        averageRatings: {
          interior: parseFloat(avgRatings?.avgInterior || 0).toFixed(1),
          exterior: parseFloat(avgRatings?.avgExterior || 0).toFixed(1),
          comfort: parseFloat(avgRatings?.avgComfort || 0).toFixed(1),
          performance: parseFloat(avgRatings?.avgPerformance || 0).toFixed(1),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reviews stats:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reviews statistics',
      error: error.message,
    });
  }
};

export const getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, carId } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (carId) {
      where.carId = carId;
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Car,
          as: 'car',
          attributes: ['id', 'make', 'model', 'year'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          total: count,
          currentPage: page,
          totalPages,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'spam'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value',
      });
    }

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found',
      });
    }

    await review.update({ status });

    return res.status(200).json({
      status: 'success',
      message: 'Review status updated successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update review status',
      error: error.message,
    });
  }
};