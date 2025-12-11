import Blog from '../models/blog.model.js';
import { Op, fn, col, literal } from 'sequelize';
import Car from '../models/car.model.js';
import Comment from '../models/comment.model.js';
import Review from '../models/review.model.js';
import User from '../models/user.model.js';

export const viewBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    console.error('Error viewing blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog', error });
  }
};

// 💬 Add a comment to a blog
export const commentBlog = async (req, res) => {
  try {
    const { id } = req.params; // blogId
    const { content } = req.body;
    const userId = req.user?.id; // assuming you attach user to req via auth middleware
    const username = req.user?.username || 'Anonymous'; // get username from authenticated user

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Ensure blog exists
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Create comment (defaults to 'pending')
    const comment = await Comment.create({
      content,
      blogId: id,
      userId,
      status: 'approved', // default status
      username, // store the username with the comment
    });

    res.status(201).json({
      message: 'Comment submitted for review',
      comment,
    });
  } catch (error) {
    console.error('Error commenting on blog:', error);
    res.status(500).json({ message: 'Failed to add comment', error });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params; // commentId
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: 'Comment content cannot be empty' });
    }

    // Find the comment by its primary key
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the authenticated user is the author of the comment
    if (comment.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to update this comment' });
    }

    // Update the comment content and set the edited flag and timestamp
    await comment.update({
      content,
      isEdited: true,
      editedAt: new Date(),
    });

    res.status(200).json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment', error });
  }
};

export const reviewCar = async (req, res) => {
  try {
    // Check for user authentication from the middleware
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User not authenticated.' });
    }

    // Get review data from the request body, but not the userId or name
    const { content, interior, exterior, comfort, performance } =
      req.body.content;

    console.log('Request body:', req.body);
    const carId = req.params.id;

    console.log('Received review data:', {
      content,
      interior,
      exterior,
      comfort,
      performance,
      carId,
    });

    // Get the user's ID and name directly from the authenticated request object
    const userId = req.user.id;
    const name = req.user.username; // Get name from the authenticated user object

    // Check if all required fields are present in the request body
    if (
      !content ||
      !carId ||
      !name ||
      interior === undefined ||
      exterior === undefined ||
      comfort === undefined ||
      performance === undefined
    ) {
      return res
        .status(400)
        .json({ message: 'Missing required review fields.' });
    }

    // Create the new review in the database
    const newReview = await Review.create({
      content,
      carId,
      userId, // Use the userId from the authenticated request
      name, // Use the name from the authenticated request
      interior,
      exterior,
      comfort,
      performance,
    });

    // Send a success response with the new review data
    res.status(201).json({
      message: 'Review submitted successfully and is awaiting moderation.',
      review: newReview,
    });
  } catch (error) {
    console.error('Error in reviewCar controller:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error while submitting review.' });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, interior, exterior, comfort, performance } =
      req.body.content;
    const userId = req.user.id;

    // Find the review by ID and ensure it belongs to the authenticated user
    const review = await Review.findOne({
      where: {
        id: id,
        userId: userId,
      },
    });

    // If the review is not found, return an error
    if (!review) {
      return res.status(404).json({
        message: 'Review not found or you do not have permission to update it.',
      });
    }

    // Update the review fields
    review.content = content || review.content;
    review.interior = interior || review.interior;
    review.exterior = exterior || review.exterior;
    review.comfort = comfort || review.comfort;
    review.performance = performance || review.performance;
    review.isEdited = true;
    review.editedAt = new Date();

    // Save the updated review
    await review.save();

    res.status(200).json({
      message: 'Review updated successfully.',
      review: review,
    });
  } catch (error) {
    console.error('Error in updateReview controller:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error while updating review.' });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const {
      carId,
      userId,
      page = 1,
      limit = 10,
      status = 'approved',
    } = req.query;
    const offset = (page - 1) * limit;

    // Build the query's where clause
    const whereClause = {
      status, // By default, only retrieve 'approved' reviews
    };
    if (carId) {
      whereClause.carId = carId;
    }
    if (userId) {
      whereClause.userId = userId;
    }

    // 1. Fetch reviews with pagination and included models
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: Car,
          as: 'car',
          attributes: ['id', 'make', 'model', 'year', 'imageUrls'],
        },
      ],
    });

    // 2. Calculate the single overall average rating
    const avgOverallRating = await Review.findOne({
      where: whereClause,
      attributes: [
        [
          fn(
            'AVG',
            literal(
              '("Review"."interiorRating" + "Review"."exteriorRating" + "Review"."comfortRating" + "Review"."performanceRating") / 4'
            )
          ),
          'averageOverallRating',
        ],
      ],
      raw: true, // Returns a plain data object
    });

    // Handle case where no reviews are found
    if (reviews.length === 0) {
      return res.status(404).json({
        message: 'No reviews found.',
        totalItems: 0,
        averageOverallRating: 0,
        reviews: [],
      });
    }

    // 3. Prepare and send the final response
    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10),
      averageRatings: parseFloat(
        avgOverallRating.averageOverallRating
      ).toFixed(2),
      reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
