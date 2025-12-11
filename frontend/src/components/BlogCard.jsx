import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useInteractStore } from '../store/useInteractStore';

const BlogCard = ({ publisher, date, title, tagline, image, link }) => {
  const { viewBlog } = useInteractStore();
  const handleViewBlog = () => {
    if (link) {
      const blogId = link.split('/').pop(); // Extract blog ID from the link
      viewBlog(blogId); // Call the viewBlog function to increment view count
    }
  };
  
  return (
    <div className="min-w-60 my-4 font-inter">
      <figure>
        <img
          src={image}
          alt={title}
          className="w-full aspect-video object-cover rounded-2xl"
        />
      </figure>
      <div className="flex w-full justify-between items-center">
        <div className=" py-2">
          <div className="flex space-x-4">
            <p className="text-sm capitalize">{publisher}</p>
            <p className="text-sm">{date}</p>
          </div>

          <div className="space-x-2 flex flex-col">
            <b className="text-md capitalize">{title}</b>{' '}
            <span className="line-clamp-1 text-md capitalize">{tagline}</span>
          </div>
        </div>
        <div>
          <button
            className="btn btn-circle btn-secondary text-white"
            onClick={() => {
              if (link) {
                window.location.href = link;
                handleViewBlog();
              }
            }}
          >
            <ArrowUpRight className="size-10" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
