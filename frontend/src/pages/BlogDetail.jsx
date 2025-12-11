import React, { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/BreadCrumbs';
import BlogCard from '../components/BlogCard';
import { useBlogStore } from '../store/useBlogStore';
import { formatTime } from '../lib/utils';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  Tag,
  MessageCircle,
} from 'lucide-react';
import CarCard from '../components/CarCard';
import {
  bmwm4,
  ceo,
  date,
  gas,
  m4,
  mileage,
  transmission,
} from '../config/images';
import { useUserAuthStore } from '../store/useUserAuthStore';
import { useInteractStore } from '../store/useInteractStore';
import Blog from '../components/Blog';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentBlog,
    isLoading,
    error,
    fetchBlogById,
    relatedBlogs,
    getRelatedBlogsById,
  } = useBlogStore();
  const { authUser } = useUserAuthStore();
  const { commentBlog, updateComment } = useInteractStore();

  const [commentForm, setCommentForm] = useState({
    name: authUser?.username || '',
    email: authUser?.email || '',
    comment: '',
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const userComment = currentBlog?.currentBlog?.comments?.find(
    (comment) => comment.userId === authUser?.id
  );

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlogById(id);
      getRelatedBlogsById(id);
      window.scrollTo(0, 0);
    }
  }, [fetchBlogById, id, getRelatedBlogsById]);

  useEffect(() => {
    if (authUser) {
      setCommentForm((prev) => ({
        ...prev,
        name: authUser.username,
        email: authUser.email,
      }));
    }
    if (currentBlog?.currentBlog?.comments) {
      const userComment = currentBlog?.currentBlog.comments.find(
        (comment) => comment.userId === authUser?.id
      );
      if (userComment) {
        setCommentForm((prev) => ({
          ...prev,
          comment: userComment.content,
        }));
      }
    }
  }, [authUser, currentBlog?.currentBlog.comments]);

  // console.log('Related Blogs:', relatedBlogs);
  console.log('Current Blog:', currentBlog);

  // Handle comment form changes
  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle comment form submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.comment.trim()) {
      return;
    }
    setIsSubmittingComment(true);
    try {
      if (userComment) {
        await updateComment(userComment.id, commentForm.comment);
        return;
      }
      await commentBlog(id, commentForm.comment);
      setCommentForm((prev) => ({ ...prev, comment: '' }));
      // Optionally, you can refetch comments here if your store supports it
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Navigation handlers
  const handlePrevPost = () => {
    if (currentBlog?.prevBlog?.id) {
      navigate(`/blog/${currentBlog.prevBlog.id}`);
    }
  };

  const handleNextPost = () => {
    if (currentBlog?.nextBlog?.id) {
      navigate(`/blog/${currentBlog.nextBlog.id}`);
    }
  };

  const hasMoreComments = currentBlog?.currentBlog?.comments && currentBlog?.currentBlog.comments.length > 5;

  // Determine which comments to display
  const commentsToDisplay = showAll ? currentBlog?.currentBlog.comments : currentBlog?.currentBlog.comments.slice(0, 5);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-base-200">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-gray-600">Loading blog post...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-base-200">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <p className="text-red-500 text-center">Error loading blog: {error}</p>
        <button
          onClick={() => navigate('/blog')}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Back to Blog List
        </button>
      </div>
    );
  }

  const blogDetail = currentBlog?.currentBlog || {};

  // If no blog found
  if (!blogDetail.id) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-base-200">
        <AlertCircle className="text-yellow-500 mb-4" size={48} />
        <p className="text-gray-600 text-center">Blog post not found</p>
        <button
          onClick={() => navigate('/blog')}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Back to Blog List
        </button>
      </div>
    );
  }

  return (
    <div className="pt-16 font-inter bg-base-200 min-h-screen">
      {/* Sticky Header */}
      {/* <section className="w-full bg-secondary pt-16 px-4 h-16 sticky top-0 z-50 shadow-sm"></section> */}

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        {/* <section className="pt-4">
          <Breadcrumbs />
        </section> */}

        {/* Blog Header */}
        <section className="py-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold capitalize mb-2">
              {blogDetail.title}
              {blogDetail.tagline && (
                <span className="text-2xl md:text-3xl font-medium ml-2 text-gray-700">
                  {blogDetail.tagline}
                </span>
              )}
            </h1>
          </div>

          {/* Author and Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={blogDetail?.author?.avatarUrl || ceo}
                alt={blogDetail?.author?.name || 'Author'}
                className="rounded-full h-12 w-12 object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = ceo; // Fallback image
                }}
              />
              <div className="flex flex-col">
                <h3 className="font-semibold capitalize text-gray-800">
                  {blogDetail.author?.name || 'Anonymous'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {blogDetail.category && (
                    <span className="flex items-center gap-1 capitalize">
                      <Tag size={14} />
                      {blogDetail.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatTime(blogDetail.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="mb-8">
          <figure className="w-full max-w-4xl mx-auto">
            <img
              src={blogDetail.featuredImage || bmwm4}
              alt={blogDetail.title || 'Blog featured image'}
              className="w-full h-full max-h-[60vh] object-cover"
              onError={(e) => {
                e.target.src = bmwm4; // Fallback image
              }}
            />
          </figure>
        </section>

        {/* Blog Content */}
        <section className="w-full max-w-4xl mx-auto">
          {/* Main Content */}
          <article className="prose prose-lg max-w-none mb-8">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  blogDetail.content ||
                  '<p>Content is loading or not available at the moment.</p>',
              }}
            />
          </article>

          {/* Tags */}
          {blogDetail.tags && blogDetail.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag size={20} className='text-primary'/>
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blogDetail.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge border border-secondary rounded-full px-3 py-2 capitalize transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <hr className="border-t border-gray-300 my-8" />

          {/** Related Cars */}
          {currentBlog?.cars?.length > 0 && (
            <div className="mb-8 w-full overflow-x-auto">
              <h2 className="text-xl font-semibold mb-6 ">Related Cars</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {currentBlog.cars.map((car) => (
                  <CarCard
                    key={car.id}
                    image={car.imageUrls[0] || m4}
                    title={car.make + ' ' + car.model}
                    description={car.description}
                    mileage={{ icon: mileage, value: car.mileage }}
                    transmission={{
                      icon: transmission,
                      value: car.transmission,
                    }}
                    fuel={{ icon: gas, value: car.fuelType }}
                    year={{ icon: date, value: car.year }}
                    price={car.price}
                    link={`/car/${car.id}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Additional Images */}
          {blogDetail.imageUrls && (
            <figure className="w-full mb-8">
              <img
                src={blogDetail.imageUrls}
                alt="Additional blog content"
                className="w-full h-full max-h-[60vh] object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide if image fails to load
                }}
              />
            </figure>
          )}

          {/* Navigation */}
          <div className="border-t border-b border-gray-300 py-6 mb-8">
            <div className="flex justify-between items-center">
              {/* Previous Post */}
              <button
                onClick={handlePrevPost}
                disabled={!currentBlog?.prevBlog}
                className={`flex items-center gap-2 p-3 rounded-lg transition ${
                  currentBlog?.prevBlog
                    ? 'hover:bg-gray-100 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={24} className="text-gray-600" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-gray-800">
                    {currentBlog?.prevBlog?.title || 'No Previous Post'}
                  </span>
                  {currentBlog?.prevBlog?.createdAt && (
                    <span className="text-xs text-gray-500">
                      {formatTime(currentBlog.prevBlog.createdAt)}
                    </span>
                  )}
                </div>
              </button>

              {/* Next Post */}
              <button
                onClick={handleNextPost}
                disabled={!currentBlog?.nextBlog}
                className={`flex items-center gap-2 p-3 rounded-lg transition ${
                  currentBlog?.nextBlog
                    ? 'hover:bg-gray-100 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col text-right">
                  <span className="text-xs font-medium text-gray-800">
                    {currentBlog?.nextBlog?.title || 'No Next Post'}
                  </span>
                  {currentBlog?.nextBlog?.createdAt && (
                    <span className="text-xs text-gray-500">
                      {formatTime(currentBlog.nextBlog.createdAt)}
                    </span>
                  )}
                </div>
                <ChevronRight size={24} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              {/* <MessageCircle size={24} /> */}
              Comments
            </h2>

            {/* Sample Comments - Replace with actual comments from your store */}
            <div className="space-y-6 mb-8">
              {/* Conditionally render the comments if the array exists */}
              {commentsToDisplay &&
                commentsToDisplay.map((comment) => (
                  <div
                    key={comment.id} // Using a unique ID is better for list performance
                    className="border-l-4 border-primary pl-4 py-3 bg-gray-50 rounded-r-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <User size={16} className="text-gray-600" />
                      <span className="font-medium text-gray-800 capitalize">
                        {comment.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        {comment.updatedAt
                          ? formatTime(comment.updatedAt)
                          : formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}

              {/* Conditionally render the "Show all" and "Hide" buttons */}
              {hasMoreComments && (
                <div className="text-center mt-4">
                  {!showAll ? (
                    <button
                      onClick={() => setShowAll(true)}
                      className="px-6 py-2 btn-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors duration-200"
                    >
                      Show all comments
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAll(false)}
                      className="px-6 py-2 bg-secondary text-white font-semibold rounded-full hover:bg-gray-300 transition-colors duration-200"
                    >
                      Hide comments
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Comment Form */}
            <div className="border-t border-gray-300 pt-8">
              <h3 className="text-xl font-semibold mb-6">Leave a Comment</h3>
              <form onSubmit={handleCommentSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={commentForm.name}
                    onChange={handleCommentChange}
                    required
                    className="peer w-full px-4 pt-6 pb-3 text-base border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    placeholder=" "
                  />
                  <label className="absolute left-4 text-gray-500 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm">
                    Your Name *
                  </label>
                </div>

                {/* Email Field */}
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={commentForm.email}
                    onChange={handleCommentChange}
                    required
                    className="peer w-full px-4 pt-6 pb-3 text-base border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    placeholder=" "
                  />
                  <label className="absolute left-4 text-gray-500 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm">
                    Your Email *
                  </label>
                </div>

                {/* Comment Field */}
                <div className="relative">
                  <textarea
                    name="comment"
                    value={commentForm.comment}
                    onChange={handleCommentChange}
                    required
                    rows="4"
                    className="peer w-full px-4 pt-6 pb-3 text-base border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-vertical"
                    placeholder=" "
                  />
                  <label className="absolute left-4 text-gray-500 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm">
                    Your Comment *
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="btn btn-primary w-full h-12 flex items-center justify-center gap-2 text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-none font-semibold"
                >
                  {isSubmittingComment ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      {userComment ? 'Update Comment' : 'Post Comment'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Related Blogs */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
              {relatedBlogs && relatedBlogs.length > 0 ? (
                relatedBlogs.map((blog) => (
                  <Blog
                   key={blog.title} item={{ ...blog }}
                  />
                ))
              ) : (
                <p>No related articles found.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogDetail;
