import {
  LogOut,
  Menu,
  User2,
  ChevronDown,
  X,
  Search,
  Loader2,
  SearchIcon,
  FilterIcon,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Range } from 'react-range';
import { useUserAuthStore } from '../store/useUserAuthStore';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { useCarStore } from '../store/useCarStore';
import toast from 'react-hot-toast';
import branding from '../config/branding';
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
  logo,
  mileage,
  pickup,
  sedan,
  sport,
  suv,
  toyota,
  transmission,
} from '../config/images';
import CarList from './CarList';

const MergedNavbar = ({ className = '' }) => {
  const { adminLogout } = useAdminAuthStore();
  const { logout, authUser, isAdmin } = useUserAuthStore();
  const { search, isSearching, searchResults, clearSearchResults } =
    useCarStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

  const filterRef = useRef(null);

  // Price range state
  const SLIDER_MIN = 1000000;
  const SLIDER_MAX = 500000000;
  const SLIDER_STEP = 1000000;
  const [values, setValues] = useState([SLIDER_MIN, SLIDER_MAX]);

  // Filter states
  const [selectedCondition, setSelectedCondition] = useState([]);
  const [selectedBodyType, setSelectedBodyType] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedFuelType, setSelectedFuelType] = useState([]);
  const [selectedMake, setSelectedMake] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);

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

  const isListings = location.pathname === '/listings';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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
  ]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((s) => !s);

  const closeDrawer = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAdminLogOut = () => {
    adminLogout();
    closeDrawer();
  };

  const handleLogOut = () => {
    logout();
    closeDrawer();
  };

  const handleSignIn = () => {
    navigate('/profile');
    closeDrawer();
  };

  const handleProfile = () => {
    navigate('/profile');
    closeDrawer();
  };

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

  const buildSearchParams = () => {
    const params = { page: 1, limit: 50 };

    if (searchQuery.trim()) params.query = searchQuery.trim();
    if (values[0] > SLIDER_MIN) params.minPrice = values[0];
    if (values[1] < SLIDER_MAX) params.maxPrice = values[1];

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

    if (selectedFuelType.length > 0) {
      const fuelTypeMap = {
        Gas: 'gasoline',
        electric: 'electric',
        hybrid: 'hybrid',
      };
      params.fuelType = selectedFuelType.map((f) => fuelTypeMap[f]).join(',');
    }

    if (selectedMake.length > 0)
      params.make = selectedMake.map((m) => m.toLowerCase()).join(',');
    if (selectedYear.length > 0) params.year = selectedYear.join(',');

    return params;
  };

  const handleSearch = async () => {
    try {
      setIsSearched(true);
      const searchParams = buildSearchParams();
      await search(searchParams);

      let message = 'Search completed';
      if (searchQuery.trim()) message += ` for "${searchQuery.trim()}"`;
      if (hasActiveFilters) message += ' with filters applied';

      toast.success(message);
      setIsFilterOpen(false);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

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
      clearSearchResults();
      toast.success('All filters cleared');
    } catch (error) {
      console.error('Clear filters error:', error);
      toast.error('Failed to clear filters');
    }
  };

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

  const getButtonClass = (path) =>
    `font-normal btn text-base bg-transparent border-0 shadow-0 hover:bg-transparent hover:shadow-none text-start justify-start ${
      location.pathname === path ? 'font-bold text-primary' : ''
    }`;

  return (
    <>
      {/* Main Pill Navbar */}
      <header className={`fixed top-4 left-0 right-0 z-50 px-4 ${className}`}>
        <div
          className={`lg:mx-4 bg-white rounded-b-4xl rounded-t-4xl shadow-lg transition-all duration-500`}
        >
          <div className="flex items-center justify-between p-1 px-2">
            {/* Left Section - Logo & Desktop Nav */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                {/* <div className="w-8 h-8 bg-primary rounded-full flex justify-center items-center text-secondary font-inter font-bold text-lg p-2">
                  AC
                </div> */}
                <span className="text- font-inter font-bold ml-2 text-secondary hidden sm:inline">
                  {branding.company.uppercaseName}
                </span>
              </Link>

              <nav className="hidden lg:flex items-center">
                <Link to="/" className={getButtonClass('/')}>
                  Home
                </Link>
                <Link to="/listings" className={getButtonClass('/listings')}>
                  Listing
                </Link>
                <Link to="/makes" className={getButtonClass('/makes')}>
                  Makes
                </Link>
                <Link to="/categories" className={getButtonClass('/categories')}>
                  Categories
                </Link>
                <Link to="/blogs" className={getButtonClass('/blogs')}>
                  Blogs
                </Link>
                <Link to="/contact" className={getButtonClass('/contact')}>
                  Contact
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={getButtonClass('/dashboard')}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex justify-center items-center space-x-2">
              {/* Center Section - Search Bar (Desktop only) */}
              <div className="hidden  lg:flex items-center flex-1 max-w-xl mx-4">
                <div className="flex items-center w-full bg-gray-100 rounded-full px-1 py-1">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center text-secondary hover:text-primary transition-colors mr-3"
                  >
                    {/* <ChevronDown className={`size-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} /> */}
                    {/* <span className="text-sm ml-1">Filters</span> */}
                    <FilterIcon className="size-5 ml-1" />
                    {hasActiveFilters && (
                      <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>

                  <input
                    type="text"
                    placeholder="Search cars..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-secondary placeholder:text-gray-500"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-gray-500 hover:text-secondary mr-2"
                    >
                      <X className="size-4" />
                    </button>
                  )}

                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-primary text-white btn btn-circle text-sm hover:bg-primary/90 transition-colors"
                  >
                    {isSearching ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <SearchIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Right Section - Auth Buttons */}
              <div className="hidden lg:flex items-center space-x-4">
                {!authUser ? (
                  <button
                    className="btn btn-circle btn-primary rounded-full text-xs font-normal text-white"
                    onClick={handleSignIn}
                  >
                    <User2 className="size-5 text-white" />
                  </button>
                ) : (
                  <button
                    className="btn btn-circle btn-primary rounded-full text-xs font-normal text-white"
                    onClick={handleProfile}
                  >
                    <User2 className="size-5 text-white" />
                  </button>
                )}
              </div>
            </div>
            {/* Mobile Menu Button */}
            <div className="flex lg:hidden justify-center items-center space-x-2">
              <div className="flex lg:hidden items-center flex-1 max-w-50 mx-4">
                <div className="flex items-center w-50 bg-gray-200 rounded-full p-1">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center text-secondary hover:text-primary transition-colors mr-3"
                  >
                    {/* <ChevronDown className={`size-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} /> */}
                    <FilterIcon className="size-5 ml-1" />
                    {hasActiveFilters && (
                      <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>

                  <input
                    type="text"
                    placeholder="Search..."
                    className="flex-1 w-25 bg-transparent border-none outline-none text-sm text-secondary placeholder:text-gray-500"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-gray-500 hover:text-secondary mr-2"
                    >
                      <X className="size-4" />
                    </button>
                  )}

                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-primary text-white rounded-full btn btn-primary btn-circle text-sm hover:bg-primary/90 transition-colors"
                  >
                    {isSearching ? (
                      <Loader2 className="size-4 animate-spin text-white" />
                    ) : (
                      <SearchIcon className="size-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-white bg-primary rounded-full relative"
              >
                <Menu
                  className={`size-6 transition-all duration-300 ${
                    isMobileMenuOpen
                      ? 'opacity-0 scale-75 rotate-90'
                      : 'opacity-100 scale-100'
                  }`}
                />
                <X
                  className={`absolute top-2 left-2 size-6 transition-all duration-300 ${
                    isMobileMenuOpen
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-75 -rotate-90'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden grid transition-all duration-500 overflow-hidden ${
              isMobileMenuOpen
                ? 'opacity-100 py-4 max-h-[600px]'
                : 'max-h-0 opacity-0 py-0'
            }`}
          >
            {/* Mobile Search */}
            {/* <div className="px-4 pb-4">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  placeholder="Search cars..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleSearchKeyPress}
                />
                <button onClick={handleSearch} className="text-primary">
                  <Search className="size-5" />
                </button>
              </div>
            </div> */}

            <nav className="mx-auto">
              <Link
                to="/"
                onClick={closeDrawer}
                className={getButtonClass('/')}
              >
                Home
              </Link>
              <Link
                to="/listings"
                onClick={closeDrawer}
                className={getButtonClass('/listings')}
              >
                Listings
              </Link>
              <Link
                to="/makes"
                onClick={closeDrawer}
                className={getButtonClass('/makes')}
              >
                Makes
              </Link>
              <Link
                to="/categories"
                onClick={closeDrawer}
                className={getButtonClass('/categories')}
              >
                Categories
              </Link>
              <Link
                to="/blogs"
                onClick={closeDrawer}
                className={getButtonClass('/blogs')}
              >
                Blogs
              </Link>
              <Link
                to="/contact"
                onClick={closeDrawer}
                className={getButtonClass('/contact')}
              >
                Contact
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={closeDrawer}
                  className={getButtonClass('/admin/dashboard')}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            <div className="px-4 pt-4 space-y-2">
              {!authUser ? (
                <button
                  className="btn btn-primary w-full rounded-full"
                  onClick={handleSignIn}
                >
                  <User2 className="size-5" /> Sign In
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-primary w-full rounded-full"
                    onClick={handleProfile}
                  >
                    <User2 className="size-5" /> Profile
                  </button>
                  {isAdmin && (
                    <button
                      className="btn btn-primary w-full rounded-full"
                      onClick={handleAdminLogOut}
                    >
                      <LogOut className="size-5" /> Logout Admin
                    </button>
                  )}
                  {!isAdmin && (
                    <button
                      className="btn btn-primary w-full rounded-full"
                      onClick={handleLogOut}
                    >
                      <LogOut className="size-5" /> Logout
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-40 px-4"
          >
            <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-xl max-h-[75vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Search Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Price Range</h3>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{formatPrice(values[0])}</span>
                  <span>{formatPrice(values[1])}</span>
                </div>
                <Range
                  step={SLIDER_STEP}
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  values={values}
                  onChange={setValues}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-2 w-full rounded-full bg-gray-200 relative"
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
                  renderThumb={({ props }) => (
                    <div
                      {...props}
                      className="h-5 w-5 rounded-full bg-primary shadow-lg border-2 border-white"
                    />
                  )}
                />
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

              {/* Condition */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Condition</h3>
                <div className="flex flex-wrap gap-2">
                  {['New', 'Used', 'Clean', 'Accident Free'].map(
                    (condition) => (
                      <button
                        key={condition}
                        onClick={() => toggleSelectCondition(condition)}
                        className={`btn btn-sm rounded-full ${
                          selectedCondition.includes(condition)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100'
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
                <h3 className="text-sm font-medium mb-3">Body Type</h3>
                <div
                  className="flex overflow-x-auto space-x-3"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {[
                    { name: 'SUV', image: suv },
                    { name: 'Sedan', image: sedan },
                    { name: 'Coupe', image: coupe },
                    { name: 'Truck', image: pickup },
                    { name: 'Convertible', image: convertible },
                    { name: 'Sport', image: sport },
                  ].map((type) => (
                    <div
                      key={type.name}
                      onClick={() => toggleSelectBodyType(type.name)}
                      className={`rounded-xl border-2 p-3 flex flex-col items-center min-w-[90px] cursor-pointer ${
                        selectedBodyType.includes(type.name)
                          ? 'bg-primary border-primary text-white'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={type.image}
                        alt={type.name}
                        className="size-8 mb-"
                      />
                      <span className="text-xs">{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryFilters.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleSelectCategory(category.id)}
                      className={`btn btn-sm rounded-full ${
                        selectedCategory.includes(category.id)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Fuel Type</h3>
                <div className="flex gap-3">
                  {[
                    { name: 'Gas', image: gas },
                    { name: 'electric', image: electric },
                    { name: 'hybrid', image: hybrid },
                  ].map((fuel) => (
                    <div
                      key={fuel.name}
                      onClick={() => toggleSelectFuelType(fuel.name)}
                      className={`rounded-full border-2 px-4 py-3 flex items-center justify-center space-x-2 flex-1 cursor-pointer ${
                        selectedFuelType.includes(fuel.name)
                          ? 'bg-primary border-primary text-white'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={fuel.image}
                        alt={fuel.name}
                        className="size-4"
                      />
                      <span className="text-sm capitalize">{fuel.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleSearch}
                className="btn btn-primary w-full rounded-full"
                disabled={isSearching}
              >
                {isSearching
                  ? 'Searching...'
                  : `Apply Filters ${
                      hasActiveFilters ? `(${getActiveFilterCount()})` : ''
                    }`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results not on Listings Page */}
      {!isListings && isSearched && searchResults && (
        <div className="fixed top-20 left-0 right-0 z-30 px-4 ">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl p-4 shadow-lg max-h-[60vh] overflow-y-auto">
            {searchResults.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-700">
                    {searchQuery
                      ? `Results for "${searchQuery}" (${searchResults.length})`
                      : `Filtered results (${searchResults.length})`}
                  </span>
                  <button
                    onClick={clearAllFilters}
                    className="text-primary text-sm hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {searchResults.map((car) => (
                    <CarList
                      key={car.id}
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
                      link={`/car/${car.id}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No cars found</p>
                <button
                  onClick={() => navigate('/listings')}
                  className="text-primary hover:underline"
                >
                  Browse all cars
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MergedNavbar;
