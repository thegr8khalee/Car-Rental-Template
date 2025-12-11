import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatPrice } from '../lib/utils';

const CarCard2 = ({
  image,
  title,
  description,
  mileage,
  transmission,
  fuel,
  year,
  price,
  dailyRate,
  link = '#',
}) => {
  return (
    <Link to={link} className="card rounded-none bg-base-100 w-full min-w-70 shadow-lg my-4">
      <figure>
        <img src={image} alt={title} className="w-full h-60 md:h-45 object-cover" />
      </figure>
      <div className="px-5 py-4">
        <h2 className="card-title">{title} {year.value}</h2>
        {/* <p className='text-sm truncate'>{description}</p> */}

        {/* Info Grid */}
        <div className="w-full flex justify-between items-center my-4 text-xs ">
          <div className="flex items-center">
            <img src={mileage.icon} alt="Mileage" className="mr-2 size-4" />
            <span>{mileage.value}</span>
          </div>
          <div className="flex items-center">
            <img
              src={transmission.icon}
              alt="Transmission"
              className="mr-2 size-4"
            />
            <span className='capitalize'>{transmission.value}</span>
          </div>
          <div className="flex items-center">
            <img src={fuel.icon} alt="Fuel" className="mr-2 size-4" />
            <span className='capitalize'>{fuel.value}</span>
          </div>
          {/* <div className="flex items-center">
            <img src={year.icon} alt="Year" className="mr-2 size-5" />
            <span>{year.value}</span>
          </div> */}
        </div>

        <hr className="border-t border-gray-300 my-2" />

        {/* Price + Link */}
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-primary">
            {formatPrice(dailyRate || price)}
            <span className="text-xs text-gray-500 font-normal ml-1">/ day</span>
          </h1>
          {/* <div className="flex items-center">
            <Link to={link} className="text-primary text-xs">
              View Details
            </Link>
            <ArrowUpRight className="stroke-primary size-5 ml-1" />
          </div> */}
        </div>
      </div>
    </Link>
  );
};

export default CarCard2;
