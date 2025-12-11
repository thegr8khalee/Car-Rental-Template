// AdminBlogs.jsx
import React, { useEffect } from 'react';
import { useDashboardStore } from '../../store/useDasboardStore';
import { ChevronDown, ChevronLeft, User, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminOpsStore } from '../../store/useAdminOpsStore';

const AdminBlogs = () => {
  const {
    getBlogs,
    blogs,
    totalBlogPages,
    currentBlogPage,
    isFetchingBlogs,
    blogError,
  } = useDashboardStore();

  console.log(blogs);

  useEffect(() => {
    getBlogs({ page: 1, limit: 10 });
  }, [getBlogs]);

  const handlePageChange = (page) => {
    const params = { page, limit: 10 };
    getBlogs(params);
  };

  if (isFetchingBlogs) return <div>Loading...</div>;
  if (blogError) return <div>Error: {blogError}</div>;
  if (blogs?.length === 0) return <div>No blogs found.</div>;

  return (
    <div className="bg-base-200 rounded-lg space-y-2 max-h-[90vh] overflow-y-auto">
      <h1 className="text-primary">{blogs?.length} Blogs</h1>
      {blogs.map((blog) => (
        <BlogCard key={blog.id} item={blog} />
      ))}
      {totalBlogPages > 1 && (
        <div className="flex items-center gap-2">
          {/* Go to Page 1 button */}
          {totalBlogPages > 3 && currentBlogPage > 3 && (
            <button
              onClick={() => handlePageChange(1)}
              className="btn btn-circle btn-primary"
            >
              1
            </button>
          )}
          {/* Prev Button */}
          {currentBlogPage > 1 && (
            <button
              onClick={() => handlePageChange(currentBlogPage - 1)}
              className="btn btn-circle btn-primary"
            >
              <ChevronLeft className="size-5 text-white" />
            </button>
          )}
          {/* Page Numbers */}
          {[...Array(totalBlogPages)]
            .map((_, index) => index + 1)
            .filter(
              (page) =>
                page >= currentBlogPage - 2 && page <= currentBlogPage + 2
            )
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-circle ${
                  page === currentBlogPage
                    ? 'btn-primary text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          {/* Next Button */}
          {currentBlogPage < totalBlogPages && (
            <button
              onClick={() => handlePageChange(currentBlogPage + 1)}
              className="btn rounded-full btn-primary"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const BlogCard = ({ item }) => {
  const [isDropDownOpen, setIsDropDownOpen] = React.useState(null);
  const [dropdownHeight, setDropdownHeight] = React.useState(0);
  const dropdownRef = React.useRef(null);
  const { deleteBlog, isLoading } = useAdminOpsStore();
  const { getBlogs } = useDashboardStore();

  React.useEffect(() => {
    if (dropdownRef.current) {
      setDropdownHeight(dropdownRef.current.scrollHeight);
    }
  }, [isDropDownOpen]);

  const handleDropDownClick = (item) => {
    if (isDropDownOpen === item) {
      setIsDropDownOpen(null);
    } else {
      setIsDropDownOpen(item);
    }
  };

  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/admin/blogs/update/${id}`);
  };

  const handleDelete = (id) => {
    window.confirm('Are you sure you want to delete this blog?') &&
      deleteBlog(id).then(() => {
        getBlogs({ page: 1, limit: 10 });
      });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'text-green-500';
      case 'draft':
        return 'text-yellow-500';
      case 'archived':
        return 'text-gray-500';
      case 'scheduled':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="rounded-xl bg-base-100">
      <div className="w-full flex items-center justify-between p-2">
        <figure>
          <img
            src={item.featuredImage || '/placeholder-blog.jpg'}
            alt={item.title}
            className="w-24 h-18 object-cover rounded"
          />
        </figure>
        <div className="h-full flex flex-col space-y-2 p-1 w-full">
          <h2 className="font-medium text-sm sm:text-base font-[inter] flex flex-col sm:flex-row">
            {item.title}
            <span className="text-gray-400 font-normal capitalize flex items-center sm:ml-2 mt-1 sm:mt-0 text-sm">
              <User className="size-4 mr-1" />
              {item.author?.name || 'Unknown'}
            </span>
            {/* <span className="capitalize px-2 py-1 rounded">
              {item.category}
            </span> */}
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center">
              <Calendar className="size-3 mr-1" />
              {item.publishedAt
                ? formatDate(item.publishedAt)
                : formatDate(item.createdAt)}
            </span>
            <span className="flex items-center">
              <Eye className="size-3 mr-1" />
              {item.viewCount || 0}
            </span>
          </div>
        </div>
        <div>
          <p
            className={`text-xs font-[montserrat] capitalize ${getStatusColor(
              item.status
            )}`}
          >
            {item.status}
          </p>
        </div>
        <button
          onClick={() => handleDropDownClick(item.id)}
          className="btn btn-circle btn-ghost"
        >
          <span
            className={`transition-transform duration-300 ease-in-out ${
              isDropDownOpen === item.id ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <ChevronDown />
          </span>
        </button>
      </div>
      <div
        ref={dropdownRef}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isDropDownOpen === item.id ? `${dropdownHeight}px` : '0px',
          opacity: isDropDownOpen === item.id ? 1 : 0,
        }}
      >
        <div className="flex p-2">
          <button
            onClick={() => handleEdit(item.id)}
            className="btn-primary btn m-2 p-2 flex-1 rounded-full"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="btn-outline border-primary border-2 text-primary btn m-2 p-2 flex-1 rounded-full"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs;
