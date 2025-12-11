import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const CarList = ({
  image,
  title,
  description,
  price,
  link = '#',
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(link)}
      className="flex bg-base-100 rounded-lg">
      <figure className='w-[30%]'>
        <img src={image} alt={title} className="w-full object-cover" />
      </figure>
      <div className="w-[70%] px-5 py-2 flex flex-col justify-between">
        <div>
          <h2 className="card-title">{title}</h2>
          <p className="text-start text-gray-600 text-sm overflow-hidden line-clamp-2">
            {description}
          </p>
        </div>

        {/* Price + Link */}
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-xl">N{price}</h1>
          {/* <div className="flex items-center">
            <Link to={link} className="text-primary text-sm">
              View Details
            </Link>
            <ArrowUpRight className="stroke-primary size-5 ml-1" />
          </div> */}
        </div>
      </div>
    </button>
  );
};

export default CarList;
