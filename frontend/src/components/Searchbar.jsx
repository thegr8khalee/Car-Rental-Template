// components/CarSearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Search, ArrowUpRight } from 'lucide-react';
import { Range } from 'react-range';
import { useCarStore } from '../store/useCarStore';
import toast from 'react-hot-toast';

// Import your car type images
import {
  audi,
  benz,
  bmw,
  convertible,
  coupe,
  date,
  electric,
  gas,
  honda,
  hybrid,
  mileage,
  pickup,
  sedan,
  sport,
  suv,
  toyota,
  transmission,
} from '../config/images';
import { useLocation, useNavigate } from 'react-router-dom';
import CarCard from './CarCard';
import CarList from './CarList';

const CarSearchBar = () => {
  const { search, isSearching, searchResults, clearSearchResults } =
    useCarStore();

  console.log(searchResults);

  // console.log('Search results count:', searchResults.length);
  // UI States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterRef = useRef(null);
  // const filterPanelRef = useRef(null);

  // Price range state - Updated for Nigerian Naira
  const SLIDER_MIN = 1000000; // 1 million NGN
  const SLIDER_MAX = 500000000; // 500 million NGN
  const SLIDER_STEP = 1000000; // 1 million NGN steps
  const [values, setValues] = useState([SLIDER_MIN, SLIDER_MAX]);

  // Filter states
  const [selectedCondition, setSelectedCondition] = useState([]);
  const [selectedBodyType, setSelectedBodyType] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedFuelType, setSelectedFuelType] = useState([]);
  const [selectedMake, setSelectedMake] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [isSearched, setIsSearched] = useState(false);

  // Generate years array (current year down to 2000)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1999 },
    (_, i) => currentYear - i
  );

  const categoryFilters = [
    { id: 'luxury', label: 'Luxury' },
    { id: 'comfort', label: 'Comfort' },
    { id: 'sport', label: 'Sport' },
    { id: 'suv', label: 'SUV' },
    { id: 'budget', label: 'Budget' },
    { id: 'pickup', label: 'Pickup' },
    { id: 'ev', label: 'EV' },
  ];

  // Format price utility for Nigerian Naira
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Check if any filters are active
  // Update active filters check whenever filters or search state change
  useEffect(() => {
    const hasFilters =
      values[0] > SLIDER_MIN ||
      values[1] < SLIDER_MAX ||
      selectedCondition.length > 0 ||
      selectedBodyType.length > 0 ||
      selectedCategory.length > 0 ||
      selectedFuelType.length > 0 ||
      selectedMake.length > 0 ||
      selectedYear.length > 0;

    setHasActiveFilters(hasFilters);
  }, [
    values,
    selectedCondition,
    selectedBodyType,
    selectedCategory,
    selectedFuelType,
    selectedMake,
    selectedYear,
    searchQuery,
    isSearched,
    searchResults,
  ]);

  // Toggle functions for multi-select filters
  const toggleSelectCondition = (condition) => {
    setSelectedCondition((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleSelectBodyType = (bodyType) => {
    setSelectedBodyType((prev) =>
      prev.includes(bodyType)
        ? prev.filter((b) => b !== bodyType)
        : [...prev, bodyType]
    );
  };

  const toggleSelectCategory = (category) => {
    setSelectedCategory((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleSelectFuelType = (fuelType) => {
    setSelectedFuelType((prev) =>
      prev.includes(fuelType)
        ? prev.filter((f) => f !== fuelType)
        : [...prev, fuelType]
    );
  };

  const toggleSelectMake = (make) => {
    setSelectedMake((prev) =>
      prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make]
    );
  };

  const toggleSelectYear = (year) => {
    setSelectedYear((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const buildSearchParams = () => {
    const params = {
      page: 1,
      limit: 50,
    };

    // Add search query if exists
    if (searchQuery.trim()) {
      params.query = searchQuery.trim();
    }

    // Add price range - only if different from defaults
    if (values[0] > SLIDER_MIN) {
      params.minPrice = values[0];
    }
    if (values[1] < SLIDER_MAX) {
      params.maxPrice = values[1];
    }

    // Add condition filters
    if (selectedCondition.length > 0) {
      const conditionMap = {
        New: 'new',
        Used: 'used',
        Clean: 'clean',
        'Accident Free': 'accident_free',
      };
      params.condition = selectedCondition
        .map((c) => conditionMap[c])
        .join(',');
    }

    // Add body type filters
    if (selectedBodyType.length > 0) {
      const bodyTypeMap = {
        SUV: 'suv',
        Sedan: 'sedan',
        Coupe: 'coupe',
        Truck: 'truck',
        Convertible: 'convertible',
        Sport: 'sports_car',
      };
      params.bodyType = selectedBodyType.map((b) => bodyTypeMap[b]).join(',');
    }

    if (selectedCategory.length > 0) {
      params.category = selectedCategory.join(',');
    }

    // Add fuel type filters
    if (selectedFuelType.length > 0) {
      const fuelTypeMap = {
        Gas: 'gasoline',
        electric: 'electric',
        hybrid: 'hybrid',
      };
      params.fuelType = selectedFuelType.map((f) => fuelTypeMap[f]).join(',');
    }

    // Add make filters (convert to lowercase for consistency)
    if (selectedMake.length > 0) {
      params.make = selectedMake.map((m) => m.toLowerCase()).join(',');
    }

    // Add year filters
    if (selectedYear.length > 0) {
      params.year = selectedYear.join(',');
    }

    return params;
  };

  // Handle search submission
  const handleSearch = async () => {
    try {
      setIsSearched(true);
      const searchParams = buildSearchParams();
      console.log('Unified search params:', searchParams);

      await search(searchParams);

      // Create appropriate toast message
      let message = 'Search completed';
      if (searchQuery.trim()) {
        message += ` for "${searchQuery.trim()}"`;
      }
      if (hasActiveFilters) {
        message += ' with filters applied';
      }

      toast.success(message);
      setIsFilterOpen(false);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Clear all filters and search
  const clearAllFilters = async () => {
    try {
      setIsSearched(false);
      setValues([SLIDER_MIN, SLIDER_MAX]);
      setSelectedCondition([]);
      setSelectedBodyType([]);
  setSelectedCategory([]);
      setSelectedFuelType([]);
      setSelectedMake([]);
      setSelectedYear([]);
      setSearchQuery('');

      // Load default cars
      // await search({ page: 1, limit: 20 });
      clearSearchResults();
      toast.success('All filters cleared');
    } catch (error) {
      console.error('Clear filters error:', error);
      toast.error('Failed to clear filters');
    }
  };

  // Get active filter count for display
  const getActiveFilterCount = () => {
    let count = 0;
    if (values[0] > SLIDER_MIN || values[1] < SLIDER_MAX) count++;
    if (selectedCondition.length > 0) count++;
    if (selectedBodyType.length > 0) count++;
  if (selectedCategory.length > 0) count++;
    if (selectedFuelType.length > 0) count++;
    if (selectedMake.length > 0) count++;
    if (selectedYear.length > 0) count++;
    return count;
  };

  const location = useLocation();
  const isHome = location.pathname === '/';

  const navigate = useNavigate();

  const handleListingsClick = () => {
    navigate('/listings');
  };

  return (
    <div className="fixed top-20 inset-x-0 text-center items-center justify-center flex flex-col w-full px-2 z-50">
      {/* Main Search Bar */}
      <div
        className={`items-center max-w-5xl justify-between p-1 flex w-full rounded-full backdrop-blur-lg h-15 z-50 relative
    ${
      isHome ? 'bg-secondary/30' : isFilterOpen ? 'bg-secondary/30' : 'bg-white'
    }`}
      >
        {/* Filter Button */}
        <div
          className={`relative ${
            isHome
              ? 'text-white'
              : isFilterOpen
              ? 'text-white'
              : 'text-gray-800'
          } items-center flex h-full px-4 border-r-2 ${
            isHome
              ? 'border-r-white/70'
              : isFilterOpen
              ? 'border-r-white/70'
              : 'border-r-black'
          } cursor-pointer text-sm transition-all duration-300 hover:bg-white/10`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          ref={filterRef}
        >
          <ChevronDown
            className={`size-5 mr-1 transform transition-transform duration-300 ${
              isFilterOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-secondary text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              {getActiveFilterCount()}
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="h-full items-center flex w-full px-4">
          {/* <Search className="size-4 text-white/70 mr-2" /> */}
          <input
            type="text"
            placeholder="Search by make, model, or year..."
            className={`input w-full border-none bg-transparent ${
              isHome ? 'text-white' : isFilterOpen ? 'text-white' : 'text-black'
            } ${
              isHome
                ? 'placeholder:text-white/70'
                : isFilterOpen
                ? 'placeholder:text-white/70'
                : 'placeholder:text-black/70'
            } shadow-none focus:outline-none`}
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-white/70 hover:text-white ml-2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <div className="h-full flex justify-end">
          <button
            className=" btn btn-primary rounded-full h-full font-normal px-6 min-w-[100px]"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Searching...
              </>
            ) : (
              'Find Cars'
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-[-5px] text-start flex justify-center items-center inset-x-0 w-full px-0 z-40"
          >
            <div className="w-full max-w-5xl bg-white text-gray-800 rounded-4xl pt-17 pb-5 p-4 shadow-xl max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="font-semibold font-inter text-lg">
                    Search Filters
                  </h1>
                  <p className="font-inter text-xs text-gray-500">
                    Narrow down your search with these filters
                  </p>
                </div>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-secondary text-sm font-medium hover:underline"
                      disabled={isSearching}
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="size-5 text-secondary" />
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h1 className="text-secondary font-medium font-inter text-sm mb-3">
                  Price Range
                </h1>
                <div className="pt-2">
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{formatPrice(values[0])}</span>
                    <span>{formatPrice(values[1])}</span>
                  </div>

                  <div className="relative h-2 mb-4">
                    <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                    <Range
                      step={SLIDER_STEP}
                      min={SLIDER_MIN}
                      max={SLIDER_MAX}
                      values={values}
                      onChange={(vals) => setValues(vals)}
                      renderTrack={({ props, children }) => (
                        <div
                          {...props}
                          className="h-2 w-full rounded-full relative bg-gray-200"
                        >
                          <div
                            className="absolute h-2 bg-primary rounded-full"
                            style={{
                              left: `${
                                ((values[0] - SLIDER_MIN) /
                                  (SLIDER_MAX - SLIDER_MIN)) *
                                100
                              }%`,
                              right: `${
                                100 -
                                ((values[1] - SLIDER_MIN) /
                                  (SLIDER_MAX - SLIDER_MIN)) *
                                  100
                              }%`,
                            }}
                          />
                          {children}
                        </div>
                      )}
                      renderThumb={({ props, isDragged }) => (
                        <div
                          {...props}
                          className={`h-5 w-5 rounded-full bg-primary shadow-lg border-2 border-white transition-transform ${
                            isDragged ? 'scale-110' : ''
                          }`}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h1 className=" font-medium font-inter text-sm mb-3">
                  Condition
                </h1>
                <div className="flex flex-wrap gap-2">
                  {['New', 'Used', 'Clean', 'Accident Free'].map(
                    (condition) => (
                      <button
                        key={condition}
                        onClick={() => toggleSelectCondition(condition)}
                        className={`btn btn-sm rounded-full font-medium transition-all ${
                          selectedCondition.includes(condition)
                            ? 'bg-primary text-secondary border-primary'
                            : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {condition}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Body Type */}
              <div className="mb-6">
                <h1 className="text font-medium font-inter text-sm mb-3">
                  Body Type
                </h1>
                <div className="flex overflow-x-auto w-full space-x-3 pb-2">
                  {[
                    { name: 'SUV', image: suv },
                    { name: 'Sedan', image: sedan },
                    { name: 'Coupe', image: coupe },
                    { name: 'Truck', image: pickup },
                    { name: 'Convertible', image: convertible },
                    { name: 'Sport', image: sport },
                  ].map((bodyType) => (
                    <div
                      key={bodyType.name}
                      className={`rounded-xl border-2 p-3 flex flex-col items-center min-w-[90px] cursor-pointer transition-all ${
                        selectedBodyType.includes(bodyType.name)
                          ? 'bg-primary text-secondary border-primary transform'
                          : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => toggleSelectBodyType(bodyType.name)}
                    >
                      <img
                        src={bodyType.image}
                        alt={bodyType.name}
                        className={`size-8 mb-2 transition-all ${
                          selectedBodyType.includes(bodyType.name)
                            ? ''
                            : 'opacity-70'
                        }`}
                      />
                      <h1 className="text-xs font-medium">{bodyType.name}</h1>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h1 className="text font-medium font-inter text-sm mb-3">
                  Category
                </h1>
                <div className="flex flex-wrap gap-2">
                  {categoryFilters.map((category) => (
                    <button
                      key={category.id}
                      className={`btn btn-sm rounded-full font-medium transition-all ${
                        selectedCategory.includes(category.id)
                          ? 'bg-primary text-secondary border-primary'
                          : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => toggleSelectCategory(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div className="mb-6">
                <h1 className="text- font-medium font-inter text-sm mb-3">
                  Fuel Type
                </h1>
                <div className="flex gap-3">
                  {[
                    { name: 'Gas', image: gas },
                    { name: 'electric', image: electric },
                    { name: 'hybrid', image: hybrid },
                  ].map((fuelType) => (
                    <div
                      key={fuelType.name}
                      className={`rounded-full border-2 px-4 py-3 flex items-center justify-center space-x-2 flex-1 cursor-pointer transition-all ${
                        selectedFuelType.includes(fuelType.name)
                          ? 'bg-primary text- border-primary '
                          : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => toggleSelectFuelType(fuelType.name)}
                    >
                      <img
                        src={fuelType.image}
                        alt={fuelType.name}
                        className={`size-4 ${
                          selectedFuelType.includes(fuelType.name)
                            ? ''
                            : 'opacity-70'
                        }`}
                      />
                      <span className="text-sm font-medium capitalize">
                        {fuelType.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Make */}
              <div className="mb-6">
                <h1 className="text- font-medium font-inter text-sm mb-3">
                  Make
                </h1>
                <div className="flex overflow-x-auto w-full space-x-3 pb-2">
                  {[
                    { name: 'mercedes', image: benz, displayName: 'Mercedes' },
                    { name: 'bmw', image: bmw, displayName: 'BMW' },
                    { name: 'audi', image: audi, displayName: 'Audi' },
                    { name: 'toyota', image: toyota, displayName: 'Toyota' },
                    { name: 'honda', image: honda, displayName: 'Honda' },
                  ].map((make) => (
                    <div
                      key={make.name}
                      className={`rounded-xl border-2 p-4 flex flex-col items-center min-w-[100px] cursor-pointer transition-all ${
                        selectedMake.includes(make.name)
                          ? 'bg-primary border-primary transform '
                          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => toggleSelectMake(make.name)}
                    >
                      <img
                        src={make.image}
                        alt={make.displayName}
                        className="h-12 w-auto object-contain"
                      />
                      <span className="text-xs font-medium  mt-1">
                        {make.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year */}
              <div className="mb-6">
                <h1 className="text- font-medium font-inter text-sm mb-3">
                  Year
                </h1>
                <div className="flex overflow-x-auto w-full space-x-2 pb-2">
                  {years.slice(0, 15).map(
                    (
                      year // Show first 15 years
                    ) => (
                      <button
                        key={year}
                        className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all min-w-[70px] ${
                          selectedYear.includes(year)
                            ? 'bg-primary text- border-primary'
                            : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => toggleSelectYear(year)}
                      >
                        {year}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSearch}
                  className="flex-1 btn btn-primary rounded-full py-3 font-medium"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Applying...
                    </>
                  ) : (
                    `Apply Filters ${
                      hasActiveFilters ? `(${getActiveFilterCount()})` : ''
                    }`
                  )}
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn btn-ghost rounded-full px-6"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      {isHome && isSearched && (
        <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-md w-full max-w-5xl mx-auto">
          {searchResults.length > 0 ? (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  {searchQuery ? (
                    <>
                      Showing results for "{searchQuery}" (
                      {searchResults.length} found)
                    </>
                  ) : (
                    <>Showing filtered results ({searchResults.length} found)</>
                  )}
                </span>
                <button
                  onClick={clearAllFilters}
                  className=" hover:text-primary/80 font-medium"
                >
                  Clear Search
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-3 max-h-[60vh] overflow-y-auto">
                {searchResults.map((relatedCar) => (
                  <CarList
                    key={relatedCar.id}
                    image={relatedCar.featuredImage}
                    title={`${relatedCar.make} ${relatedCar.model}`}
                    description={relatedCar.description}
                    mileage={{ icon: mileage, value: relatedCar.mileage }}
                    transmission={{
                      icon: transmission,
                      value: relatedCar.transmission,
                    }}
                    fuel={{ icon: gas, value: relatedCar.fuelType }}
                    year={{ icon: date, value: relatedCar.year }}
                    price={relatedCar.price}
                    link={`/car/${relatedCar.id}`}
                  />
                ))}
              </div>

              <div>
                <button
                  onClick={handleListingsClick}
                  className="text-primary font-medium mt-2 hover:underline items-center justify-center flex mx-auto"
                >
                  View All Results
                  <ArrowUpRight className="size-4 inline-block ml-1" />
                </button>
              </div>
            </>
          ) : (
            <div>
              <div className="w-full flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  <X />
                </button>
              </div>
              <p className="text-gray-500 text-center">
                No cars found for your search.
              </p>
              <button
                onClick={handleListingsClick}
                className="mt-4 text-primary hover:text-primary/80 font-medium"
              >
                Browse all cars
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarSearchBar;
