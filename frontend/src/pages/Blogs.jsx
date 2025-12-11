import React from 'react';
import BlogCard from '../components/BlogCard';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useBlogStore } from '../store/useBlogStore';
import { useEffect } from 'react';
import Blog from '../components/Blog';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Blogs = () => {
  const {blogs, fetchBlogs, error, isLoading, pagination} = useBlogStore();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handlePageChange = (page) => {
    // Pass the page number inside an object to match the getCars function's signature
    fetchBlogs({ page });
  };

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="font-inter bg-base-200">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        id="Blogs"
        className="my-12 pt-26 mx-auto w-full overflow-hidden flex flex-col justify-center items-center text-center border-none px-4 lg:px-12 gap-6"
      >
        <div className="w-full flex justify-start  items-center">
          <h1 className="text-5xl font-medium font-inter text-start">
            Blogs: Latest News & Insights
          </h1>
          {/* <button
              className="btn hidden sm:block btn-primary rounded-full"
              // onClick={handleListingsClick}
            >
              View All
            </button> */}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col lg:flex-row lg:space-x-4 items-center justify-between w-full h-full "
        >
          {/* Image Section */}
          <div className="w-full lg:w-1/2 h-[240px] sm:h-[320px] lg:h-[400px] mb-4 rounded-none overflow-hidden shadow-sm">
            <img
              src={blogs[0]?.featuredImage}
              alt={blogs[0]?.title}
              className="w-full h-full object-cover rounded-none transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col justify-between w-full lg:w-1/2 space-y-5 text-start">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs sm:text-sm font-medium">
                  {blogs[0]?.category}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm">
                  6 min read
                </span>
              </div>

              <h1 className="text-2xl font-bold sm:google-headline-large">
                {blogs[0]?.title}
              </h1>

              <p className="text-gray-600 text-sm sm:text-base mt-2 line-clamp-3">
                {blogs[0]?.content}
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate(`/blog/${blogs[0].id}`)}
                className="btn btn-primary  text-white px-5 py-2 rounded-full text-sm sm:text-base"
              >
                Read Full Blog
              </button>
            </div>
          </div>
        </motion.div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* <div className="lg:hidden w-20"></div> */}
          {blogs.slice(1).map((blog, index) => (
            <motion.div
              key={blog.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
            >
              <Blog item={{ ...blog }} />
            </motion.div>
          ))}
          {/* <div className="w-20"></div> */}
        </div>
      </motion.section>
    </div>
  );
};

export default Blogs;
