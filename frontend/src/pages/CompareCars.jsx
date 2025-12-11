import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PaintBucket,
  Search,
  UserRound,
  X,
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCarStore } from '../store/useCarStore';
import CarCard from '../components/CarCard';
import CarCardSuggestion from '../components/ComparisonSuggestion';
import { date, gas, mileage, transmission } from '../config/images';

const CompareCars = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const { car: currentCar, getCarById, search, searchResults, isSearching, isLoading } = useCarStore();
  
  const [selectedCar1, setSelectedCar1] = useState(null);
  const [selectedCar2, setSelectedCar2] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [relatedCars, setRelatedCars] = useState([]);

  // Get the first car ID from URL params or location state
  const car1Id = searchParams.get('car1') || location.state?.carId;

  useEffect(() => {
    if (car1Id) {
      getCarById(car1Id).then((data) => {
        if (data?.car) {
          setSelectedCar1(data.car);
          setRelatedCars(data.relatedCars || []);
        }
      });
    }
  }, [car1Id, getCarById]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(() => {
        search({ query: searchQuery });
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, search]);

  const handleSelectCar = (car) => {
    setSelectedCar2(car);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleRemoveCar2 = () => {
    setSelectedCar2(null);
  };

  const ComparisonCard = ({ car, position }) => {
    if (!car) {
      return (
        <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="size-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Select a car to compare</h3>
            <p className="text-gray-500">Choose from suggestions below or search</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative">
          <img
            src={car.imageUrls?.[0] || car.featuredImage}
            alt={`${car.make} ${car.model}`}
            className="w-full aspect-video object-cover"
          />
          {position === 'right' && (
            <button
              onClick={handleRemoveCar2}
              className="absolute top-2 right-2 btn btn-circle btn-sm bg-white/80 backdrop-blur-sm border-0"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-1">
            {car.make} {car.model}
          </h2>
          <p className="text-gray-500 mb-2">{car.year}</p>
          <p className="text-xl font-semibold text-primary mb-4">
            N{car.price?.toLocaleString()}
          </p>

          <div className="space-y-4">
            <ComparisonRow label="Mileage" value={`${car.mileage} km`} />
            <ComparisonRow label="Fuel Type" value={car.fuelType} />
            <ComparisonRow label="Transmission" value={car.transmission} />
            <ComparisonRow label="Body Type" value={car.bodyType} />
            <ComparisonRow label="Condition" value={car.condition} />
            <ComparisonRow label="Engine Size" value={`${car.engineSize}L`} />
            <ComparisonRow label="Cylinders" value={car.cylinder} />
            <ComparisonRow label="Color" value={car.color} />
            <ComparisonRow label="Doors" value={car.door} />
            <ComparisonRow label="Horsepower" value={`${car.horsepower} hp`} />
            <ComparisonRow label="Torque" value={`${car.torque} Nm`} />
            <ComparisonRow label="0-100 km/h" value={`${car.zeroToHundred}s`} />
          </div>
          <div className="mt-6 w-full justify-end flex">
            <button 
            onClick={() => navigate(`/car/${car.id}`)}
            className='btn btn-primary rounded-full'>
              View Details
              <ArrowUpRight className="stroke-secondary size-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ComparisonRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900 capitalize">{value || 'N/A'}</span>
    </div>
  );

  const RelatedCarCard = ({ car }) => (
    <div
      onClick={() => handleSelectCar(car)}
      className="flex-shrink-0 w-72 bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
    >
      <img
        src={car.featuredImage || car.imageUrls?.[0]}
        alt={`${car.make} ${car.model}`}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">
          {car.make} {car.model}
        </h3>
        <p className="text-gray-500 text-sm mb-2">{car.year}</p>
        <p className="text-primary font-semibold mb-3">
          N{car.price?.toLocaleString()}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">{car.mileage} km</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500 capitalize">{car.fuelType}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading && !selectedCar1) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 font-inter">
      <div className="bg-secondary h-16 w-full sticky top-0 z-50"></div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost rounded-full mb-4"
          >
            <ChevronLeft className="size-5" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Compare Cars</h1>
          <p className="text-gray-600">
            Compare specifications and features side by side
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for a car to compare..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 2);
              }}
              className="w-full px-4 py-4 pr-12 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none text-lg"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-6 text-gray-400" />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute z-10 w-full max-w-2xl mt-2 bg-white rounded-xl shadow-xl max-h-96 overflow-y-auto">
              <div className="p-4">
                {isSearching ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin size-6 text-primary" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-500 mb-3">Search Results</p>
                    {searchResults.map((car) => (
                      <div
                        key={car.id}
                        onClick={() => handleSelectCar(car)}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <img
                          src={car.featuredImage || car.imageUrls?.[0]}
                          alt={`${car.make} ${car.model}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold">
                            {car.make} {car.model}
                          </p>
                          <p className="text-sm text-gray-500">{car.year}</p>
                        </div>
                        <p className="ml-auto text-primary font-semibold">
                          N{car.price?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-4">No results found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <ComparisonCard car={selectedCar1} position="left" />
          <ComparisonCard car={selectedCar2} position="right" />
        </div>

        {/* Detailed Comparison Table - Only show when both cars selected */}
        {selectedCar1 && selectedCar2 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Detailed Comparison</h2>

            {/* Dimensions */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Dimensions & Capacity</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-3 px-4">Specification</th>
                      <th className="text-center py-3 px-4">
                        {selectedCar1.make} {selectedCar1.model}
                      </th>
                      <th className="text-center py-3 px-4">
                        {selectedCar2.make} {selectedCar2.model}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Length</td>
                      <td className="py-3 px-4 text-center">{selectedCar1.length || 'N/A'} cm</td>
                      <td className="py-3 px-4 text-center">{selectedCar2.length || 'N/A'} cm</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Width</td>
                      <td className="py-3 px-4 text-center">{selectedCar1.width || 'N/A'} cm</td>
                      <td className="py-3 px-4 text-center">{selectedCar2.width || 'N/A'} cm</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Trunk Capacity</td>
                      <td className="py-3 px-4 text-center">{selectedCar1.trunkCapacity || 'N/A'} L</td>
                      <td className="py-3 px-4 text-center">{selectedCar2.trunkCapacity || 'N/A'} L</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Tire Size</td>
                      <td className="py-3 px-4 text-center">{selectedCar1.tireSize || 'N/A'}</td>
                      <td className="py-3 px-4 text-center">{selectedCar2.tireSize || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Features Comparison */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {['interior', 'exterior', 'comfort', 'safety'].map((category) => (
                  <div key={category}>
                    <h4 className="font-semibold mb-3 capitalize">{category}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{selectedCar1.make} {selectedCar1.model}</p>
                        <ul className="space-y-1">
                          {selectedCar1[category]?.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <Check className="size-3 text-primary flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <hr />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{selectedCar2.make} {selectedCar2.model}</p>
                        <ul className="space-y-1">
                          {selectedCar2[category]?.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <Check className="size-3 text-primary flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Cars */}
        {!selectedCar2 && relatedCars.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Suggested Cars to Compare</h2>
            <div className="flex overflow-x-auto gap-4 pb-4">
              {relatedCars.map((car) => (
                <CarCardSuggestion
                  key={car.id}
                  className="flex-shrink-0"
                  image={car.imageUrls[0]}
                  title={`${car.make} ${car.model}`}
                  description={car.description}
                  mileage={{ icon: mileage, value: car.mileage }}
                  transmission={{
                    icon: transmission,
                    value: car.transmission,
                  }}
                  fuel={{ icon: gas, value: car.fuelType }}
                  year={{ icon: date, value: car.year }}
                  price={car.price}
                  link={() => handleSelectCar(car)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareCars;
