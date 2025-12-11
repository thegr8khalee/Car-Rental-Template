import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Range } from 'react-range';
import { FaCheckCircle } from 'react-icons/fa';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  FilterIcon,
  MailIcon,
  Star,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CarCard from '../components/CarCard';
import TeamCard from '../components/TeamCard';
import BlogCard from '../components/BlogCard';
import {
  Hero,
  Heromobile,
  audi,
  benz,
  bmw,
  calc,
  ceo,
  convertible,
  coupe,
  date,
  discount,
  engine,
  gas,
  honda,
  mercedes,
  mileage,
  pickup,
  price,
  sedan,
  sell,
  service,
  sport,
  suv,
  toyota,
  transmission,
  trusted,
  benz1,
  bmw1,
  toyota1,
  honda1,
  luxury,
  comfort,
  sport1,
  suv1,
} from '../config/images';
// import CarSearchBar from '../components/Searchbar';
import { useCarStore } from '../store/useCarStore';
import { useBlogStore } from '../store/useBlogStore';
import { useInteractStore } from '../store/useInteractStore';
import toast from 'react-hot-toast';
import branding from '../config/branding';
import MakeCard from '../components/MakeCard';
import { Datepicker } from 'flowbite-react';
import Blog from '../components/Blog';
import CategoryCard from '../components/CategoryCard';

const Home = () => {
  const [isFocusedCarPrice, setIsFocusedCarPrice] = useState(false);
  const [isFocusedTerm, setIsFocusedTerm] = useState(false);
  const [isFocusedDownPayment, setIsFocusedDownPayment] = useState(false);
  const { cars, isLoading, getCars } = useCarStore();
  const { blogs, fetchBlogs, isLoading: isLoadingBlogs } = useBlogStore();
  const { reviews, getAllReviews, isFetchingReviews } = useInteractStore();
  const [formData, setFormData] = useState({
    carPrice: '',
    term: '',
    downPayment: '',
  });

  const [monthlyPayment, setMonthlyPayment] = useState(null);

  const calculateInstallment = () => {
    // Validate all required fields are filled
    if (!formData.carPrice || !formData.term || !formData.downPayment) {
      toast.error('Please fill in all fields');
      return;
    }

    const price = parseFloat(formData.carPrice);
    const down = parseFloat(formData.downPayment);
    const years = parseFloat(formData.term);

    // Validate values are positive numbers
    if (price <= 0 || down < 0 || years <= 0) {
      toast.error('Please enter valid positive numbers');
      return;
    }

    // Check if down payment is not greater than car price
    if (down >= price) {
      toast.error('Down payment cannot be greater than or equal to car price');
      return;
    }

    // Calculate loan amount
    const loanAmount = price - down;

    // Typical interest rate (you can make this configurable)
    const annualInterestRate = 0.05; // 5% annual interest rate
    const monthlyInterestRate = annualInterestRate / 12;
    const numberOfPayments = years * 12;

    // Calculate monthly payment using the loan payment formula
    // M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
    let monthly;

    if (monthlyInterestRate === 0) {
      // If no interest, simple division
      monthly = loanAmount / numberOfPayments;
    } else {
      const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
      monthly = (loanAmount * (monthlyInterestRate * x)) / (x - 1);
    }

    setMonthlyPayment(monthly);
  };

  useEffect(() => {
    getCars();
    fetchBlogs();
    getAllReviews();
  }, [getCars, fetchBlogs, getAllReviews]);

  // console.log(reviews);

  const selectBodyType = (bodyType) => {
    navigate('/listings', { state: { bodyType } });
  };

  const selectMake = (make) => {
    navigate('/listings', { state: { make } });
  };

  const [activeTab, setActiveTab] = useState('Latest');

  const tabs = ['Latest Cars', 'Featured Cars', 'Popular Cars'];

  const navigate = useNavigate();

  const handleListingsClick = () => {
    navigate('/listings');
  };

  const bodyTypes = [
    { label: 'SUV', img: suv },
    { label: 'Sedan', img: sedan },
    { label: 'Coupe', img: coupe },
    { label: 'Truck', img: pickup },
    { label: 'Convertible', img: convertible },
    { label: 'Sport', img: sport },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? reviews.reviews.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === reviews.reviews.length - 1 ? 0 : prev + 1
    );
  };

  // const review = reviews?.reviews[currentIndex];

  console.log(blogs);

  return (
    <div className="bg-base-200" style={{ scrollbarWidth: 'none' }}>
      <div id="mobile view" className="">
        <section
          id="hero"
          className="relative lg:hidden w-full h-screen bg-cover bg-center flex flex-col justify-between p-4"
          style={{ backgroundImage: `url(${Heromobile})` }}
        >
          {/* Middle Content */}
          <div className="relative pt-25 z-10 text-white text-left">
            <h1 className="text-2xl font-medium font-inter drop-shadow-lg">
              Lamborghini
            </h1>
            <h1 className="text-5xl font-bold font-inter drop-shadow-lg">
              Aventador 2020
            </h1>
            <p className="text-xs mt-2 max-w-xs">
              Experience the thrill of the 2020 Aventador. Unmatched
              performance, breathtaking design, and pure adrenaline.
            </p>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 w-full">
            <div className="bg-white/3 backdrop-blur-sm rounded-none p-1 flex justify-around items-center text-white text-xs mb-2">
              <div className="flex items-center space-x-2 p-2">
                <img src={mileage} alt="mileage" className="w-5 h-5 invert" />
                <span className="text-lg">2,000km</span>
              </div>
              <div className="flex items-center space-x-2 p-2">
                <img
                  src={transmission}
                  alt="transmission"
                  className="w-5 h-5 invert"
                />
                <span className="text-lg">Auto</span>
              </div>
              <div className="flex items-center space-x-2 p-2">
                <img src={gas} alt="fuel" className="w-5 h-5 invert" />
                <span className="text-lg">Gas</span>
              </div>
              <div className="hidden items-center space-x-2 p-2">
                <img src={engine} alt="engine" className="w-5 h-5" />
                <span>6.5L V12</span>
              </div>
            </div>
            <div className="bg-white/3 backdrop-blur-sm rounded-none p-3">
              <div className="flex justify-between items-center">
                <div className="text-white">
                  <span className="text-sm text-gray-400">Price</span>
                  <p className="font-bold text-2xl">N500M</p>
                </div>
                <div className="h-10 border-l border-white/50"></div>
                <div className="text-white text-center">
                  <span className="text-sm text-gray-400">Engine</span>
                  <p className="font-bold text-lg">6.5L V12</p>
                </div>
                <div className="h-10 border-l border-white/50"></div>
                <div className="text-white text-center">
                  <span className="text-sm text-gray-400">Year</span>
                  <p className="font-bold text-lg">2020</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 mt-3">
                <button className="btn btn-secondary sm:flex-1 rounded-none">
                  View Details
                </button>
                <button className="btn btn-primary sm:flex-1 rounded-none">
                  Browse Cars
                </button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="desktop hero"
          className="relative hidden w-full h-screen bg-cover bg-center lg:flex flex-col justify-between p-12"
          style={{ backgroundImage: `url(${Heromobile})` }}
        >
          {/* Middle Content - Hero Text */}
          <div className="pt-25 relative z-10 w-full max-w-7xl mx-auto text-white">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-medium font-inter drop-shadow-lg">
                Lamborghini
              </h2>
              <h1 className="text-7xl font-bold font-inter drop-shadow-lg">
                Aventador 2020
              </h1>
              <p className="text-base mt-4 max-w-lg">
                Experience the thrill of the 2020 Aventador. Unmatched
                performance, breathtaking design, and pure adrenaline await.
                Discover the legend.
              </p>
            </div>
          </div>

          {/* Bottom Content - Details Card */}
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <div className="bg-white/2 backdrop-blur-sm rounded-none p-6 flex items-center justify-between">
              {/* Price */}
              <div className="text-white">
                <span className="text-sm text-gray-400">Price</span>
                <p className="font-bold text-4xl">N500M</p>
              </div>
              <div className="h-16 border-l border-white/30"></div>

              {/* Specs */}
              <div className="flex items-center space-x-8 text-white">
                <div className="flex items-center space-x-3">
                  {/* <img
                    src={mileage}
                    alt="mileage"
                    className="w-8 h-8 filter invert"
                  /> */}
                  <div>
                    <span className="text-xs text-gray-400">Mileage</span>
                    <p className="font-semibold text-lg">2,000 km</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* <img
                    src={transmission}
                    alt="transmission"
                    className="w-8 h-8 filter invert"
                  /> */}
                  <div>
                    <span className="text-xs text-gray-400">Transmission</span>
                    <p className="font-semibold text-lg">Automatic</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* <img
                    src={engine}
                    alt="engine"
                    className="w-8 h-8 filter invert"
                  /> */}
                  <div>
                    <span className="text-xs text-gray-400">Engine</span>
                    <p className="font-semibold text-lg">6.5L V12</p>
                  </div>
                </div>
              </div>
              <div className="h-16 border-l border-white/30"></div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button className="btn btn-secondary btn-lg rounded-none px-8">
                  View Details
                </button>
                <button className="btn btn-primary btn-lg rounded-none px-8">
                  Browse Cars
                </button>
              </div>
            </div>
          </div>
        </section>
        <section id="top makes" className="w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-3xl font-medium font-inter mb-2">Top Makes</h1>
            <button className="hidden sm:block btn btn-primary rounded-full">
              View all
            </button>
          </div>

          <div className="md:hidden grid grid-cols-2 gap-2">
            <MakeCard img={benz1} label="Mercedes" />
            <MakeCard img={bmw1} label="BMW" />
            <MakeCard img={toyota1} label="Toyota" />
            <MakeCard img={honda1} label="Honda" />
          </div>
          <div
            className="hidden md:flex w-full overflow-x-auto flex-nowrap gap-4 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            <MakeCard img={benz1} label="Mercedes" />
            <MakeCard img={bmw1} label="BMW" />
            <MakeCard img={toyota1} label="Toyota" />
            <MakeCard img={honda1} label="Honda" />
          </div>
          <div className="mt-4 w-full flex justify-end">
            <button className="sm:hidden btn btn-primary rounded-full">
              View all
            </button>
          </div>
        </section>
        <section id="top listings" className="bg-gray-200 w-full py-12 pr-0">
          <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-medium font-inter mb-2">
              Top Listings
            </h1>
            <button
              className="btn hidden sm:block btn-primary rounded-full"
              onClick={handleListingsClick}
            >
              View All
            </button>
          </div>

          <div
            className="flex overflow-x-auto w-full max-w-7xl mx-auto space-x-2"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="w-4"></div>
            {isLoading ? (
              <p>Loading cars...</p>
            ) : cars?.length === 0 ? (
              <p>No cars found</p>
            ) : (
              cars?.slice(0, 4).map((car) => (
                <CarCard
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
                  dailyRate={car.dailyRate}
                  link={`/car/${car.id}`}
                />
              ))
            )}
            <div className="w-4"></div>
          </div>
          <div className="mt-4 sm:hidden w-full max-w-7xl mx-auto flex justify-end pr-2">
            <button
              className="btn btn-primary rounded-full"
              onClick={handleListingsClick}
            >
              View All
            </button>
          </div>
        </section>
        <section
          id="top categories"
          className="w-full max-w-7xl mx-auto py-8 px-4"
        >
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-3xl font-medium font-inter mb-2">
              Top Categories
            </h1>
            <button className="hidden sm:block btn btn-primary rounded-full">
              View all
            </button>
          </div>

          <div className="md:hidden grid grid-cols-2 gap-2">
            <CategoryCard img={luxury} label="Luxury" />
            <CategoryCard img={comfort} label="Comfort" />
            <CategoryCard img={sport1} label="Sport" />
            <CategoryCard img={suv1} label="SUV" />
          </div>
          <div
            className="hidden md:flex w-full overflow-x-auto flex-nowrap gap-4 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            <CategoryCard img={luxury} label="Luxury" />
            <CategoryCard img={comfort} label="Comfort" />
            <CategoryCard img={sport1} label="Sport" />
            <CategoryCard img={suv1} label="SUV" />
          </div>
          <div className="mt-4 w-full flex justify-end">
            <button className="sm:hidden btn btn-primary rounded-full">
              View all
            </button>
          </div>
        </section>
        <section
          id="form"
          className="w-full py-25 px-4 h-full"
          style={{
            backgroundImage: `url(${Hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between items-center justify-center">
            <h1 className="text-5xl font-medium font-inter mb-2 text-white">
              Request VIP Showing
            </h1>
            <form
              action=""
              className="mt-4 md:mt-0 border border-white/50 max-w-md my-auto bg-white/10 p-4 py-6 backdrop-blur-sm"
            >
              <h1 className="text-2xl font-medium font-inter mb-2 text-white">
                Contact Information
              </h1>
              <input
                type="text"
                placeholder="Enter your name"
                className="input input-bordered border-white/50 rounded-none bg-transparent text-white  w-full mb-4"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered border-white/50 rounded-none bg-transparent text-white  w-full mb-4"
              />
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="input input-bordered border-white/50 rounded-none bg-transparent text-white placeholder:text-gray-400 w-full mb-4"
              />
              <input
                type="date"
                placeholder="Preferred Date"
                className="input input-bordered border-white/50 rounded-none bg-transparent text-white placeholder:text-gray-400 w-full mb-4"
              />
              <textarea
                placeholder="Enter your message"
                className="textarea textarea-bordered border-white/50 rounded-none bg-transparent text-white placeholder:text-gray-400 w-full mb-4"
              ></textarea>
              <button
                type="submit"
                className="btn btn-primary w-full rounded-none"
              >
                Submit
              </button>
            </form>
          </div>
        </section>
        {branding.features.blog && (
          <section
            id="Blogs"
            className="my-12 mx-auto w-full overflow-hidden flex flex-col justify-center items-center text-center border-none px-4 lg:px-12 pt-4 gap-6"
          >
            <div className="w-full flex justify-between items-center">
              <h1 className="text-3xl font-medium font-inter">Blog Posts</h1>
              <button
                className="btn hidden sm:block btn-primary rounded-full"
                onClick={handleListingsClick}
              >
                View All
              </button>
            </div>
            <div className="flex flex-col lg:flex-row lg:space-x-4 items-center justify-between w-full h-full ">
              {/* Image Section */}
              <div className="w-full lg:w-1/2 h-[240px] sm:h-[320px] lg:h-[400px] mb-4 rounded-none overflow-hidden shadow-sm">
                <img
                  src={blogs[0]?.featuredImage}
                  alt={blogs[0]?.title}
                  className="w-full h-full object-cover rounded-none transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-between w-full lg:w-1/2 space-y-5 text-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs sm:text-sm font-medium">
                      {blogs[0]?.category}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      6 min read
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold sm:google-headline-large">
                    {blogs[0]?.title}
                  </h1>

                  <p className="text-gray-600 text-sm sm:text-base mt-2 line-clamp-3">
                    {blogs[0]?.content}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => navigate(`/blog/${blogs[0].id}`)}
                    className="btn btn-primary  text-white px-5 py-2 rounded-full text-sm sm:text-base"
                  >
                    Read Full Blog
                  </button>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* <div className="lg:hidden w-20"></div> */}
              {blogs.slice(1).map((blog) => (
                <Blog key={blog.title} item={{ ...blog }} />
              ))}
              {/* <div className="w-20"></div> */}
            </div>
          </section>
        )}
      </div>

      <div id="desktop view" className="hidden">
        <section
          id="hero"
          className="relative w-full h-screen bg-cover bg-center f1lex flex-col justify-between p-12"
          style={{ backgroundImage: `url(${Heromobile})` }}
        >
          {/* Middle Content - Hero Text */}
          <div className="pt-25 relative z-10 w-full max-w-7xl mx-auto text-white">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-medium font-inter drop-shadow-lg">
                Lamborghini
              </h2>
              <h1 className="text-7xl font-bold font-inter drop-shadow-lg">
                Aventador 2020
              </h1>
              <p className="text-base mt-4 max-w-lg">
                Experience the thrill of the 2020 Aventador. Unmatched
                performance, breathtaking design, and pure adrenaline await.
                Discover the legend.
              </p>
            </div>
          </div>

          {/* Bottom Content - Details Card */}
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <div className="bg-white/2 backdrop-blur-sm rounded-none p-6 flex items-center justify-between">
              {/* Price */}
              <div className="text-white">
                <span className="text-sm text-gray-400">Price</span>
                <p className="font-bold text-4xl">N500M</p>
              </div>
              <div className="h-16 border-l border-white/30"></div>

              {/* Specs */}
              <div className="flex items-center space-x-8 text-white">
                <div className="flex items-center space-x-3">
                  {/* <img
                    src={mileage}
                    alt="mileage"
                    className="w-8 h-8 filter invert"
                  /> */}
                  <div>
                    <span className="text-xs text-gray-400">Mileage</span>
                    <p className="font-semibold text-lg">2,000 km</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* <img
                    src={transmission}
                    alt="transmission"
                    className="w-8 h-8 filter invert"
                  /> */}
                  <div>
                    <span className="text-xs text-gray-400">Transmission</span>
                    <p className="font-semibold text-lg">Automatic</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* <img
                    src={engine}
                    alt="engine"
                    className="w-8 h-8 filter invert"
                  /> */}
                  <div>
                    <span className="text-xs text-gray-400">Engine</span>
                    <p className="font-semibold text-lg">6.5L V12</p>
                  </div>
                </div>
              </div>
              <div className="h-16 border-l border-white/30"></div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button className="btn btn-secondary btn-lg rounded-none px-8">
                  View Details
                </button>
                <button className="btn btn-primary btn-lg rounded-none px-8">
                  Browse Cars
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="Body Type"
          className="w-full py-8 px-4 items-center justify-center flex"
        >
          <div className="w-full max-w-6xl">
            <h1 className="text-xl font-semibold font-inter mb-2">Body Type</h1>
            <div className="flex overflow-x-auto space-x-4">
              {bodyTypes.map(({ label, img }) => {
                // const isSelected = selectedBodyType.includes(label);

                return (
                  <div
                    key={label}
                    className={`rounded-xl border border-gray-400 p-1 px-10 flex flex-col items-center text-xs transition cursor-pointer`}
                    onClick={() => selectBodyType(label)}
                  >
                    <img src={img} alt={label} className={`max-w-20`} />
                    <h1 className={`text-xs`}>{label}</h1>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {branding.features.selling && (
          <section
            id="Sell"
            className="relative w-full bg-black flex justify-center p-4"
          >
            <div className="flex items-center space-x-4 h-110  w-full max-w-6xl">
              <div className="relative w-[50vw] rounded-2xl">
                <img
                  src={sell}
                  alt="Sell"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="relative z-10 w-[50vw] px-4">
                <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold font-inter">
                  Get A Fair Price For Your Car, Sell To Us Today.
                </h1>
                <p className="text-white text-xs lg:text-sm font-inter mt-2">
                  Skip the endless negotiations — we’ll value your car honestly
                  and pay you on the spot.
                </p>
                <div className="flex flex-col space-y-2 mt-2 text-xs md:text-base">
                  <div className="flex space-x-2 text-white">
                    <CircleCheck className="stroke-white mr-2" />
                    Fast and transparent process
                  </div>
                  <div className="flex space-x-2 text-white">
                    <CircleCheck className="stroke-white mr-2" />
                    Instant payment, no hidden fees
                  </div>
                  <div className="flex space-x-2 text-white">
                    <CircleCheck className="stroke-white mr-2" />
                    Trusted by thousands of car owners across Nigeria
                  </div>
                </div>

                <div className="flex space-x-2 mt-4 w-full ">
                  <button
                    onClick={() => navigate('/sell/form')}
                    className="flex-1 btn md:btn-lg btn-primary rounded-full font-medium w-full"
                  >
                    Sell Now
                  </button>
                  <button
                    onClick={() => navigate('/sell')}
                    className="flex-1 btn md:btn-lg backdrop-blur-lg bg-secondary/30 border-none shadow-none text-white rounded-full font-medium"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
        {branding.features.rentals && (
          <section id="listings" className="w-full p-4 pr-0">
            <div className="w-full max-w-6xl mx-auto">
              <div className="flex w-full justify-between items-center">
                <h1 className="text-xl font-semibold font-inter mb-2">
                  Explore All Cars
                </h1>
                <button
                  className="btn btn-primary rounded-full"
                  onClick={handleListingsClick}
                >
                  View All
                  <ArrowUpRight className="stroke-whitesize-5" />
                </button>
              </div>

              <div className="flex w-full justify-between">
                <div className="flex flex-shrink-0 space-x-8 border-gray-200"></div>
                <div className="w-full flex justify-end pr-2"></div>
              </div>

              <div className="flex overflow-x-auto w-full space-x-2 pl-1">
                {isLoading ? (
                  <p>Loading cars...</p>
                ) : cars?.length === 0 ? (
                  <p>No cars found</p>
                ) : (
                  cars?.slice(0, 10).map((car) => (
                    <CarCard
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
                      dailyRate={car.dailyRate}
                      link={`/car/${car.id}`}
                    />
                  ))
                )}
              </div>
            </div>
          </section>
        )}
        {branding.features.rentals && (
          <section id="makes" className="w-full p-4 items-start justify-center">
            <div className="w-full max-w-6xl mx-auto">
              {/* <h6 className="text-primary font-inter">Top Makes</h6> */}
              <div className="flex w-full justify-between">
                <div>
                  <h1 className="font-bold text-xl font-inter">
                    Explore Our Top Makes
                  </h1>
                </div>
                <button
                  onClick={() => navigate('/makes')}
                  className="btn btn-primary rounded-full"
                >
                  View All <ArrowUpRight className="size-5" />
                </button>
              </div>
              <div className="mt-2 flex overflow-x-auto w-full space-x-10">
                {[
                  { name: 'mercedes', src: benz },
                  { name: 'bmw', src: bmw },
                  { name: 'audi', src: audi },
                  { name: 'toyota', src: toyota },
                  { name: 'honda', src: honda },
                ].map(({ name, src }) => (
                  <div
                    key={name}
                    className={`rounded-xl flex-shrink-0 p-2 flex flex-col justify-center items-center text-xs transition `}
                    onClick={() => selectMake(name)}
                  >
                    <img
                      src={src}
                      alt={name}
                      className="w-30 md:w-40 h-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        <section
          id="Why Choose Us"
          className="bg-secondary items-center justify-center py-12 flex px-4"
        >
          <div className="w-full max-w-6xl">
            <h1 className="font-bold text-white text-2xl font-inter">
              Why Choose Us?
            </h1>
            <div className="flex justify-between items-center text-center">
              <div className="flex flex-col space-y-2 items-center my-8  w-full">
                <img src={discount} alt="discount" className="size-15" />
                <h1 className="text-white font-medium">
                  Special Financing Offers
                </h1>
              </div>
              <div className="flex flex-col space-y-2 items-center my-8  w-full">
                <img src={trusted} alt="trusted" className="size-13" />
                <h1 className="text-white font-medium">Trusted by Thousands</h1>
              </div>
              <div className="flex flex-col space-y-2 items-center my-8  w-full">
                <img src={price} alt="price" className="size-13" />
                <h1 className="text-white font-medium">Competitive Pricing</h1>
              </div>
              <div className="flex flex-col space-y-2 items-center my-8  w-full">
                <img src={service} alt="service" className="size-13" />
                <h1 className="text-white font-medium">Expert Car Service</h1>
              </div>
            </div>

            <div className="flex justify-between items-center text-center">
              <div className="flex flex-col items-center w-full ">
                <h1 className="text-primary font-bold font-inter text-4xl">
                  100k
                </h1>
                <p className="text-white">Cars Sold</p>
              </div>
              <div className="flex flex-col items-center w-full ">
                <h1 className="text-primary font-bold font-inter text-4xl">
                  100k
                </h1>
                <p className="text-white">Cars Sold</p>
              </div>
              <div className="flex flex-col items-center w-full ">
                <h1 className="text-primary font-bold font-inter text-4xl">
                  100k
                </h1>
                <p className="text-white">Cars Sold</p>
              </div>
              <div className="flex flex-col items-center w-full ">
                <h1 className="text-primary font-bold font-inter text-4xl">
                  100k
                </h1>
                <p className="text-white">Cars Sold</p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="team"
          className="w-full p-4 py-8 items-center justify-center flex"
        >
          <div className=" w-full max-w-6xl">
            <h1 className="font-inter text-2xl font-bold my-4">
              Meet Our Team
            </h1>
            <div className="w-full flex space-x-4 overflow-x-auto">
              <TeamCard
                image={ceo}
                name={branding.company.ceo.name}
                title="CEO"
                description={branding.company.ceo.bio}
              />
              <TeamCard
                image={ceo}
                name="John Smith"
                title="CTO"
                description="Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
              />
              <TeamCard
                image={ceo}
                name="Alice Johnson"
                title="CFO"
                description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
              />
              <TeamCard
                image={ceo}
                name="Alice Johnson"
                title="CFO"
                description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
              />
            </div>
          </div>
        </section>
        {branding.features.showTestimonials &&
          reviews &&
          !isFetchingReviews &&
          reviews.reviews &&
          reviews.reviews.length > 0 && (
            <section
              id="review"
              className="w-full flex justify-center items-center p-4 py-12 bg-secondary font-inter"
            >
              <div className="w-full max-w-6xl mx-auto">
                <h1 className="font-bold text-white text-2xl">
                  What Our Clients Say
                </h1>

                <div className="flex space-x-2 my-1">
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 1
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 2
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 3
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 4
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 5
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                </div>

                <p className="text-white mt-2">
                  <b>{reviews.averageRatings}</b> Based on{' '}
                  <b>{reviews.totalItems}</b> Reviews
                </p>

                <div className="mt-4 w-full">
                  {/* Header: Name + Nav Buttons */}
                  <div className="w-full flex justify-between items-center">
                    <div>
                      <h1 className="text-white text-lg">
                        {reviews.reviews[currentIndex]?.name}
                      </h1>
                      <p className="text-gray-400 text-sm">
                        {reviews.reviews[currentIndex]?.car.make}{' '}
                        {reviews.reviews[currentIndex]?.car.model} (
                        {reviews.reviews[currentIndex]?.car.year})
                      </p>
                    </div>

                    <div className="space-x-2 flex">
                      <button
                        onClick={handlePrev}
                        className="btn btn-primary btn-circle"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        onClick={handleNext}
                        className="btn btn-primary btn-circle"
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mt-2">
                    <p className="text-white font-light text-sm">
                      {reviews.reviews[currentIndex]?.content}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        {branding.features.blog && (
          <section
            id="blogs"
            className="w-full flex justify-center items-center p-4 py-8"
          >
            <div className="w-full max-w-6xl">
              <div className="flex w-full justify-between items-center">
                <h1 className="font-inter text-2xl font-bold">Recent Blogs</h1>
                <div>
                  <button
                    onClick={() => navigate('/blogs')}
                    className="btn btn-primary rounded-full flex"
                  >
                    View All <ArrowUpRight />
                  </button>
                </div>
              </div>

              <div className="w-full flex space-x-4 overflow-x-auto ">
                {isLoadingBlogs ? (
                  <p>Loading...</p>
                ) : (
                  blogs
                    ?.slice(0, 10)
                    .map((blog) => (
                      <BlogCard
                        key={blog.id}
                        publisher={blog.publisher}
                        date={blog.date}
                        title={blog.title}
                        tagline={blog.tagline}
                        image={blog.featuredImage}
                        link={`/blog/${blog.id}`}
                      />
                    ))
                )}
              </div>
            </div>
          </section>
        )}
        <section id="Calc" className="relative w-full flex justify-end">
          <div className="flex items-center justify-center h-150 space-x-4  bg-black w-full">
            <img
              src={calc}
              alt="Sell"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative max-w-6xl  z-10 h-full w-full p-8 items-center flex justify-end">
              <div className="bg-white max-w-2xl shadow-lg rounded-3xl w-full p-8 items-center justify-center">
                <h1 className="font-inter text-3xl font-bold">
                  Installment Plan Calculator
                </h1>
                <p className="text-sm font-inter mt-1">
                  Use this calculator to know how much would pay in intallment
                  for a full car purchase over a period of time.
                </p>
                <form action="" className="my-2">
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={formData.carPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          carPrice: e.target.value,
                        })
                      }
                      onFocus={() => setIsFocusedCarPrice(true)}
                      onBlur={() => setIsFocusedCarPrice(false)}
                      className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder=" " // Trick for floating label
                    />
                    <label
                      className={`absolute left-3 transition-all duration-300 
          ${
            isFocusedCarPrice || formData.carPrice
              ? 'text-xs top-2 text-gray-500'
              : 'text-gray-400 top-5 text-sm'
          } 
        `}
                    >
                      Car Price (N)
                    </label>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <div className="relative w-80">
                      <input
                        type="number"
                        value={formData.term}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            term: e.target.value,
                          })
                        }
                        onFocus={() => setIsFocusedTerm(true)}
                        onBlur={() => setIsFocusedTerm(false)}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder=" " // Trick for floating label
                      />
                      <label
                        className={`absolute left-3 transition-all duration-300 
          ${
            isFocusedTerm || formData.term
              ? 'text-xs top-2 text-gray-500'
              : 'text-gray-400 top-5 text-sm'
          } 
        `}
                      >
                        Installment Term (years)
                      </label>
                    </div>
                    <div className="relative w-80">
                      <input
                        type="number"
                        value={formData.downPayment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            downPayment: e.target.value,
                          })
                        }
                        onFocus={() => setIsFocusedDownPayment(true)}
                        onBlur={() => setIsFocusedDownPayment(false)}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder=" " // Trick for floating label
                      />
                      <label
                        className={`absolute left-3 transition-all duration-300 
          ${
            isFocusedDownPayment || formData.downPayment
              ? 'text-xs top-2 text-gray-500'
              : 'text-gray-400 top-5 text-sm'
          } 
        `}
                      >
                        Down Payment (N)
                      </label>
                    </div>
                  </div>
                  {monthlyPayment !== null && (
                    <div className="mt-6 p-4 bg-primary/10 rounded-2xl">
                      <p className="text-sm text-gray-600">
                        Estimated Monthly Payment
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        N
                        {monthlyPayment.toLocaleString('en-NG', {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Based on {formData.term} years with{' '}
                        {(0.05 * 100).toFixed(1)}% annual interest
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={calculateInstallment}
                    className="w-full h-15 mt-2 text-white btn-primary btn-lg rounded-full"
                  >
                    Calculate
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
