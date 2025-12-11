import React from 'react';
import { formatTime } from '../lib/utils';
import { Star } from 'lucide-react';

const Review = ({ review }) => {
    
  const CalculatedRating = Math.round(
    (review?.interiorRating +
      review?.exteriorRating +
      review?.comfortRating +
      review?.performanceRating) /
      4
  );

  return (
    <div className=''>
      <div className="flex space-x-4 items-center truncate whitespace-nowrap overflow-hidden">
        <h1 className="font-medium text-base sm:text-lg">{review?.name}</h1>
        <p className='text-sm text-gray-500'>{formatTime(review?.createdAt)}</p>
      </div>
      <div className="flex space-x-2 my-1">
        <Star className={` stroke-0 size-4 ${CalculatedRating >= 1 ? 'fill-primary' : 'fill-gray-300'}`} />
        <Star className={` stroke-0 size-4 ${CalculatedRating >= 2 ? 'fill-primary' : 'fill-gray-300'}`} />
        <Star className={` stroke-0 size-4 ${CalculatedRating >= 3 ? 'fill-primary' : 'fill-gray-300'}`} />
        <Star className={` stroke-0 size-4 ${CalculatedRating >= 4 ? 'fill-primary' : 'fill-gray-300'}`} />
        <Star className={` stroke-0 size-4 ${CalculatedRating >= 5 ? 'fill-primary' : 'fill-gray-300'}`} />
      </div>
      <p className=" text-sm">
        {review?.content}
      </p>
    </div>
  );
};

export default Review;
