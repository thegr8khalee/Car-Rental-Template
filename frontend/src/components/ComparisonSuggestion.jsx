import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import { electric, gas, hybrid } from '../config/images';

const CarCardSuggestion = ({
  image,
  title,
  description,
  mileage,
  transmission,
  fuel,
  year,
  price,
  link = '#',
}) => {
  const returnFuelIcon = (fuelType) => {
    switch (fuelType.toLowerCase()) {
      case 'gasoline':
        return gas;
      case 'diesel':
        return gas;
      case 'electric':
        return electric;
      case 'hybrid':
        return hybrid;
      default:
        return gas;
    }
  };

  return (
    <button 
    onClick={link}
    className="card rounded-2xl bg-base-100 min-w-70 shadow-lg my-4">
      <figure>
        <img src={image} alt={title} className="w-full h-40 object-cover" />
      </figure>
      <div className="px-5 py-4">
        <h2 className="card-title">{title}</h2>
        <p className="text-gray-600 text-sm truncate whitespace-nowrap overflow-hidden">
          {description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 my-4 text-sm">
          <div className="flex items-center">
            <img src={mileage.icon} alt="Mileage" className="mr-2 size-5" />
            <span>{mileage.value}</span>
          </div>
          <div className="flex items-center">
            <img
              src={transmission.icon}
              alt="Transmission"
              className="mr-2 size-5"
            />
            <span className="capitalize">{transmission.value}</span>
          </div>
          <div className="flex items-center">
            <img
              src={returnFuelIcon(fuel.value)}
              alt="Fuel"
              className="mr-2 size-5"
            />
            <span className="capitalize">{fuel.value}</span>
          </div>
          <div className="flex items-center">
            <img src={year.icon} alt="Year" className="mr-2 size-5" />
            <span className="capitalize">{year.value}</span>
          </div>
        </div>

        <hr className="border-t border-gray-300 my-2" />

        {/* Price + button */}
        <div className="flex justify-between items-center">
          <h1 className="font-semibold">N{price}</h1>
          <div className="flex items-center">
            {/* <button to={link} className="text-primary text-sm">
              View Details
            </button> */}
            {/* <button className="btn btn-sm btn-primary rounded-full">
              View Details
              <ArrowUpRight className="stroke-secondary size-5 ml-1" />
            </button> */}
          </div>
        </div>
      </div>
    </button>
  );
};

export default CarCardSuggestion;
