import Blog from '../models/blog.model.js';
import { Op } from 'sequelize';
import sequelize from '../lib/db.js';
import Comment from '../models/comment.model.js';
import Car from '../models/car.model.js';

export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Use findAndCountAll to get both the blogs and the total count for pagination metadata
    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: {
        status: 'published', // Only show published blogs
      },
      limit,
      offset,
      order: [['publishedAt', 'DESC']], // Order by most recent first
    });

    res.status(200).json({
      message: 'Blogs retrieved successfully',
      data: blogs,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalBlogs: count,
    });
  } catch (error) {
    console.error('Error fetching all blogs:', error);
    res.status(500).json({
      message: 'An error occurred while fetching blogs',
      error: error.message,
    });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the current blog post by its UUID
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: Comment,
          as: 'comments',
          // Only include comments that have been approved.
          where: { status: 'approved' },
          // The `required: false` option is crucial. It performs a LEFT JOIN,
          // which means the blog post will still be returned even if it has no approved comments.
          required: false,
          // Order the comments by creation date in descending order (newest first).
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Now fetch the cars referenced in the blog's carIds field.
    let cars = [];
    if (blog.carIds && blog.carIds.length > 0) {
      cars = await Car.findAll({
        where: {
          id: {
            [Op.in]: blog.carIds,
          },
        },
      });
    }

    // Use the index of the current blog to find the previous and next blogs.
    // We only need a few fields for the navigation links.
    const prevBlog = await Blog.findOne({
      where: { index: blog.index - 1 },
      attributes: ['id', 'title', 'createdAt'],
    });

    const nextBlog = await Blog.findOne({
      where: { index: blog.index + 1 },
      attributes: ['id', 'title', 'createdAt'],
    });

    res.status(200).json({
      message: 'Blog post retrieved successfully',
      data: {
        currentBlog: blog,
        prevBlog: prevBlog || null, // Return null if a previous blog doesn't exist
        nextBlog: nextBlog || null, // Return null if a next blog doesn't exist
        cars: cars, // Add the fetched cars to the response
      },
    });
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
    res.status(500).json({
      message: 'An error occurred while fetching the blog post',
      error: error.message,
    });
  }
};

export const searchBlogs = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        message: 'Search query cannot be empty.',
      });
    }

    const searchQuery = `%${query.trim()}%`;

    const blogs = await Blog.findAll({
      where: {
        status: 'published', // Only search within published blogs
        [Op.or]: [
          { title: { [Op.like]: searchQuery } },
          { tagline: { [Op.like]: searchQuery } },
          // Convert tags JSON array to a string for a string-based search
          sequelize.where(
            sequelize.fn(
              'JSON_UNQUOTE',
              sequelize.fn('JSON_EXTRACT', sequelize.col('tags'), '$')
            ),
            {
              [Op.like]: searchQuery,
            }
          ),
        ],
      },
      order: [['publishedAt', 'DESC']],
    });

    if (blogs.length > 0) {
      res.status(200).json({
        message: 'Blogs found successfully',
        data: blogs,
      });
    } else {
      res.status(404).json({
        message: `No blogs found matching the query: "${query}"`,
      });
    }
  } catch (error) {
    console.error('Error during blog search:', error);
    res.status(500).json({
      message: 'An error occurred while searching for blogs',
      error: error.message,
    });
  }
};

export const getRelatedBlogsById = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    // Validate the blog ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Blog ID is required',
      });
    }

    // First, get the target blog
    const targetBlog = await Blog.findByPk(id, {
      attributes: ['id', 'category', 'tags', 'carIds'],
    });

    if (!targetBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Build the related blogs query with multiple criteria
    const whereConditions = {
      id: { [Op.ne]: id }, // Exclude the target blog
      status: 'published', // Only get published blogs
    };

    // Create an array to store OR conditions for finding related blogs
    const orConditions = [];

    // 1. Same category (highest priority)
    orConditions.push({
      category: targetBlog.category,
    });

    // 2. Shared car IDs
    if (targetBlog.carIds && targetBlog.carIds.length > 0) {
      // Using JSON_OVERLAPS for MySQL or JSON array operations
      orConditions.push(
        sequelize.literal(
          `JSON_OVERLAPS(carIds, '${JSON.stringify(targetBlog.carIds)}')`
        )
      );
    }

    // 3. Shared tags
    if (targetBlog.tags && targetBlog.tags.length > 0) {
      orConditions.push(
        sequelize.literal(
          `JSON_OVERLAPS(tags, '${JSON.stringify(targetBlog.tags)}')`
        )
      );
    }

    // Combine all conditions
    whereConditions[Op.or] = orConditions;

    // Get related blogs with scoring for better relevance
    const relatedBlogs = await Blog.findAll({
      where: whereConditions,
      attributes: [
        'id',
        'title',
        'tagline',
        'featuredImage',
        'category',
        'tags',
        'carIds',
        'viewCount',
        'createdAt',
        'publishedAt',
        'seoTitle',
        'seoDescription',
        'author',
        // Add a relevance score based on matching criteria
        [
          sequelize.literal(`
            CASE 
              WHEN category = '${targetBlog.category}' THEN 3
              ELSE 0
            END +
            CASE 
              WHEN JSON_OVERLAPS(carIds, '${JSON.stringify(
                targetBlog.carIds || []
              )}') THEN 2
              ELSE 0
            END +
            CASE 
              WHEN JSON_OVERLAPS(tags, '${JSON.stringify(
                targetBlog.tags || []
              )}') THEN 1
              ELSE 0
            END
          `),
          'relevanceScore',
        ],
      ],
      order: [
        [sequelize.literal('relevanceScore'), 'DESC'],
        ['viewCount', 'DESC'],
        ['publishedAt', 'DESC'],
      ],
      limit: limit,
    });

    // If we don't have enough related blogs, get some popular blogs from the same category
    if (relatedBlogs.length < limit) {
      const additionalBlogs = await Blog.findAll({
        where: {
          id: {
            [Op.notIn]: [id, ...relatedBlogs.map((blog) => blog.id)],
          },
          status: 'published',
          category: targetBlog.category,
        },
        attributes: [
          'id',
          'title',
          'tagline',
          'featuredImage',
          'category',
          'tags',
          'carIds',
          'viewCount',
          'createdAt',
          'publishedAt',
          'seoTitle',
          'seoDescription',
          'author',
        ],
        order: [
          ['viewCount', 'DESC'],
          ['publishedAt', 'DESC'],
        ],
        limit: limit - relatedBlogs.length,
      });

      relatedBlogs.push(...additionalBlogs);
    }

    // If still not enough, get most popular blogs overall
    if (relatedBlogs.length < limit) {
      const popularBlogs = await Blog.findAll({
        where: {
          id: {
            [Op.notIn]: [id, ...relatedBlogs.map((blog) => blog.id)],
          },
          status: 'published',
        },
        attributes: [
          'id',
          'title',
          'tagline',
          'featuredImage',
          'category',
          'tags',
          'carIds',
          'viewCount',
          'createdAt',
          'publishedAt',
          'seoTitle',
          'seoDescription',
          'author',
        ],
        order: [
          ['viewCount', 'DESC'],
          ['publishedAt', 'DESC'],
        ],
        limit: limit - relatedBlogs.length,
      });

      relatedBlogs.push(...popularBlogs);
    }

    return res.status(200).json({
      success: true,
      message: 'Related blogs retrieved successfully',
      data: {
        relatedBlogs: relatedBlogs.slice(0, limit),
        totalFound: relatedBlogs.length,
      },
    });
  } catch (error) {
    console.error('Error fetching related blogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching related blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
