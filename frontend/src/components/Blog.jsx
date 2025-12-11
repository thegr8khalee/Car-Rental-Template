import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
// import Button from './Button';
import { useNavigate } from 'react-router-dom';

const Blog = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col text-start overflow-y-hidden  w-full mr-4 cursor-pointer" onClick={() => navigate(`/blog/${item.id}`)}>
      <img
        src={item.featuredImage}
        alt={item.title}
        className="rounded-none aspect-video object-cover mb-4"
      />
      <div>
        <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary rounded-full google-label-small text-xs">
          {item.category}
        </span>
        <span className="google-body-medium ml-2 text-xs">6 min read</span>
      </div>
      <h1 className="font-medium mb-2 text-start">{item.title}</h1>
      <p className="google-body-medium text-start line-clamp-2">
        {item.description}
      </p>
    </div>
  );
};

export default Blog;
