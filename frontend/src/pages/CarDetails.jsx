import React, { useCallback, useState } from 'react';
import {
  ArrowUpDown,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PaintBucket,
  Phone,
  Share,
  Star,
  UserRound,
  Video,
  X,
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
// import Breadcrumbs from '../components/BreadCrumbs';

// Using placeholder URLs for images and Breadcrumbs component
// const Breadcrumbs = () => <div className="text-sm text-gray-500 mb-2">Home &gt; BMW &gt; M3</div>;
import mileage from '/images/mileage.png';
import transmission from '/images/transmission.png';
import sedan from '/images/sedan.png';
import engine from '/images/engine.png';
import door from '/images/door.png';
import cylinder from '/images/cylinder.png';
import gas from '/images/gas.png';
import whatsapp from '/images/whatsapp.png';
import CarCard from '../components/CarCard';
import date from '/images/date.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useCarStore } from '../store/useCarStore';
import { useEffect } from 'react';
import Review from '../components/Review';
import toast from 'react-hot-toast';
import { useInteractStore } from '../store/useInteractStore';
import { useUserAuthStore } from '../store/useUserAuthStore';
import { formatPrice } from '../lib/utils';
import BookingWizard from '../components/BookingWizard';

const CarDetails = () => {
  const { id } = useParams();
  // console.log('Car ID from params:', id);
  const { car: currentCar, getCarById, isLoading } = useCarStore();
  const { authUser } = useUserAuthStore();
  // Data for car features and tabs

  useEffect(() => {
    getCarById(id);

    if (car?.imageUrls) {
      car.imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [getCarById, id]);

  const car = currentCar?.car;
  const reviews = currentCar?.reviews || [];
  const averageRatings = currentCar?.averageRatings || {
    interior: 0,
    exterior: 0,
    comfort: 0,
    performance: 0,
    overall: 0,
  };

  // console.log('Current Car relatedCars:', currentCar?.relatedCars);

  console.log('Car Details:', currentCar);

  const [activeTab, setActiveTab] = useState('overview');
  const tabs = ['overview', 'description', 'features'];
  const [testDriveFormData, setTestDriveFormData] = useState({
    name: '',
    email: '',
    date: '',
  });
  const [calcFormData, setCalcFormData] = useState({
    price: '',
    years: '',
    downPayment: '',
  });

  // Floating label state and change handlers
  const handleTestDriveChange = (e) => {
    const { name, value } = e.target;
    setTestDriveFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleCalcChange = (e) => {
    const { name, value } = e.target;
    setCalcFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const navigate = useNavigate();

  const handleListingsClick = () => {
    navigate('/listings');
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  const images = car?.imageUrls || [];

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const getRatingStatus = (score) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    return 'Needs Improvement';
  };

  const carId = id;

  const Star1 = ({ filled, onClick }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? '#ff0000' : 'none'}
      stroke="#ff0000"
      strokeWidth="1.5"
      className="size-5 transition-transform duration-200 cursor-pointer text-yellow-400"
      onClick={onClick}
    >
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.6l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.6l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );

  const { reviewCar, updateReview } = useInteractStore();

  const [formData, setFormData] = useState({
    exterior: 0,
    interior: 0,
    comfort: 0,
    performance: 0,
    content: '',
  });
  const [loading, setLoading] = useState(false);

  // Function to handle rating input
  const handleRatingChange = (category, rating) => {
    setFormData((prevData) => ({
      ...prevData,
      [category]: rating,
    }));
  };

  // Function to handle content input
  const handleContentChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      content: e.target.value,
    }));
  };

  const userReviewed = reviews.some((review) => review.userId === authUser?.id);

  console.log('User Reviewed:', userReviewed);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) {
      toast.error('You must be logged in to submit a review.');
      return;
    }
    if (userReviewed) {
      await updateReview(
        reviews.find((review) => review.userId === authUser?.id).id,
        formData
      );
      return;
    }
    setLoading(true);

    // Check if any rating is 0
    if (Object.values(formData).some((value) => value === 0)) {
      toast.error('Please provide a rating for all categories.');
      setLoading(false);
      return;
    }

    // Check if the content is empty
    if (!formData.content.trim()) {
      toast.error('Please write a review message.');
      setLoading(false);
      return;
    }

    try {
      const response = await reviewCar(carId, formData);

      if (response) {
        console.log('Review response:', response);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to submit review.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareClick = () => {
    navigate(`/compare?car1=${id}`, {
      state: { carId: id },
    });
  };

  const [monthlyPayment, setMonthlyPayment] = useState(null);

  const calculateInstallment = () => {
    // Validate all required fields are filled
    if (!calcFormData.years || !calcFormData.downPayment) {
      toast.error('Please fill in all fields');
      return;
    }

    const price = parseFloat(car?.price);
    const down = parseFloat(calcFormData.downPayment);
    const years = parseFloat(calcFormData.years);

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

  const ratingCategories = ['Exterior', 'Interior', 'Comfort', 'Performance'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 font-inter bg-base-200">
      <div id="main-content mobile" className="sm:hidden w-full">
        {/* <div className="bg-secondary h-16 w-full sticky top-0 z-50"></div> */}
        <div className="w-full max-w-7xl mx-auto px-4 mt-2">
          {/* <Breadcrumbs /> */}

          {/* New Hero Section with Image and CTAs */}
          <section
            id="hero"
            className="grid grid-cols-1 md:grid-cols-2 mb-6"
          >
            <div className="flex justify-around items-center space-x-2 mt-6">
              <button
                className="flex-1 btn rounded-full border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-200"
                onClick={() => handleShare()}
              >
                <Share className="size-5 text-primary" /> Share
              </button>
              <button
                onClick={handleCompareClick}
                className="flex-1 btn rounded-full border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-200"
              >
                <ArrowUpDown className="size-5 text-primary" /> Compare
              </button>
              <button className="flex-1 btn rounded-full border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-200">
                <Bookmark className="size-5 text-primary" /> Save
              </button>
            </div>
            {/* Image Gallery */}
            {car?.imageUrls && car?.imageUrls.length > 0 && (
              <div className="relative flex justify-center items-center h-[40vh]">
                {/* Prev button */}
                <button
                  onClick={prevImage}
                  disabled={images.length <= 1}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md shadow-lg border-0 rounded-full p-3 hover:scale-100 active:scale-100 transition-none"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="size-6 text-white" />
                </button>

                {/* Current image */}
                {images.length > 0 ? (
                  <img
                    src={images[currentIndex]}
                    alt={`Car image ${currentIndex + 1}`}
                    className="rounded-xl h-70 w-full object-cover"
                  />
                ) : (
                  <div className="w-full h-50 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    No Image Available
                  </div>
                )}

                {/* Next button */}
                <button
                  onClick={nextImage}
                  disabled={images.length <= 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md shadow-lg border-0 rounded-full p-3 hover:scale-100 active:scale-100 transition-none"
                  aria-label="Next Image"
                >
                  <ChevronRight className="size-6 text-white" />
                </button>
              </div>
            )}

            {/* Thumbnail Strip - Mobile */}
            {car?.imageUrls && car?.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-3 p-1 scrollbar-hide">
                {car.imageUrls.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      currentIndex === idx
                        ? 'border-primary shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Price and Action Buttons */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl sm:text-5xl font-medium">{car?.make}</h1>
                <span className="text-3xl font-bold">{car?.model} </span>
                <span className="text-3xl font-bold">{car?.year}</span>
                <h1 className="text-2xl sm:text-3xl font-medium mt-2 text-primary">
                 {formatPrice(car?.price)}
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
                <button
                  className="btn btn-primary w-full h-15 rounded-xl font-bold text-lg"
                  onClick={() =>
                    document.getElementById('test_drive_modal').showModal()
                  }
                >
                  Schedule a Test Drive
                </button>
                <dialog id="test_drive_modal" className="modal">
                  <div className="modal-box bg-white p-6 py-8 rounded-xl shadow-xl">
                    <button
                      className="btn btn-circle bg-transparent border-0 shadow-none btn-sm absolute right-2 top-2"
                      onClick={() =>
                        document.getElementById('test_drive_modal').close()
                      }
                    >
                      <X className="size-5" />
                    </button>
                    <h2 className="text-2xl font-semibold mb-4">
                      Schedule a Test Drive
                    </h2>
                    <form action="" className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={testDriveFormData.name}
                          onChange={handleTestDriveChange}
                          className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder=" "
                        />
                        <label
                          htmlFor="name"
                          className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                            testDriveFormData.name &&
                            'top-2 text-xs text-primary'
                          }`}
                        >
                          Your Name
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={testDriveFormData.email}
                          onChange={handleTestDriveChange}
                          className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder=" "
                        />
                        <label
                          htmlFor="email"
                          className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                            testDriveFormData.email &&
                            'top-2 text-xs text-primary'
                          }`}
                        >
                          Your Email
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="date"
                          name="date"
                          value={testDriveFormData.date}
                          onChange={handleTestDriveChange}
                          className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder=" "
                        />
                        <label
                          htmlFor="date"
                          className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                            testDriveFormData.date &&
                            'top-2 text-xs text-primary'
                          }`}
                        >
                          Select Date
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full h-15 mt-2 text-white btn-primary btn-lg text-lg rounded-xl font-semibold"
                      >
                        Submit
                      </button>
                    </form>
                  </div>
                </dialog>
                <button
                  className="btn btn-secondary w-full h-15 rounded-xl font-bold text-lg"
                  onClick={() => document.getElementById('Contact').showModal()}
                >
                  Contact Us
                </button>
                <dialog id="Contact" className="modal">
                  <div className="modal-box bg-white p-6 py-8 rounded-xl shadow-xl">
                    <button
                      className="btn btn-circle bg-transparent border-0 shadow-none btn-sm absolute right-2 top-2"
                      onClick={() => document.getElementById('Contact').close()}
                    >
                      <X className="size-5" />
                    </button>
                    <h2 className="text-2xl font-semibold mb-4">
                      Contact Us Now!
                    </h2>
                    <div className="w-full flex justify-between my-4 space-x-2">
                      <button className="btn btn-lg bg-blue-500 rounded-full w-full flex-1 shadow-none border-none">
                        <Phone className="size-6 fill-white stroke-white" />
                      </button>
                      <button className="text-white btn btn-lg bg-green-500 rounded-full w-full flex-1 shadow-none border-none">
                        <img
                          src={whatsapp}
                          alt="WhatsApp"
                          className="size-6 fill-white stroke-white"
                        />
                      </button>
                    </div>
                    <form action="" className="space-y-4">
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={testDriveFormData.email}
                          onChange={handleTestDriveChange}
                          className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder=" "
                        />
                        <label
                          htmlFor="name"
                          className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                            testDriveFormData.name &&
                            'top-2 text-xs text-primary'
                          }`}
                        >
                          Email
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          name="subject"
                          value={testDriveFormData.subject}
                          onChange={handleTestDriveChange}
                          className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder=" "
                        />
                        <label
                          htmlFor="email"
                          className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                            testDriveFormData.email &&
                            'top-2 text-xs text-primary'
                          }`}
                        >
                          Subject
                        </label>
                      </div>
                      <div className="relative">
                        <textarea
                          name="message"
                          value={testDriveFormData.message}
                          onChange={handleTestDriveChange}
                          className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder=" "
                        />
                        <label
                          htmlFor="message"
                          className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                            testDriveFormData.message &&
                            'top-2 text-xs text-primary'
                          }`}
                        >
                          Message
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full h-15 mt-2 text-white btn-primary btn-lg text-lg rounded-xl font-semibold"
                      >
                        Send Us a Message
                      </button>
                    </form>
                  </div>
                </dialog>
              </div>

      
            </div>
          </section>

          {/* Specs and Tabs Section */}
          <section className="w-full">
            {/* Key Specs */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 space-x-2 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <img src={mileage} alt="Mileage" className="size-6" />
                <span className="text-xs md:text-base text-primary">{car?.mileage} Km</span>
              </div>
              <div className="p-2 space-x-2 rounded-xl bg-white shadow-sm flex justify-center items-center">
                <img src={gas} alt="Gas" className="size-6" />
                <span className="text-xs md:text-base capitalize text-primary">
                  {car?.fuelType}
                </span>
              </div>
              <div className="p-2 space-x-2 rounded-xl bg-white shadow-sm flex justify-center items-center">
                <img
                  src={transmission}
                  alt="Transmission"
                  className="size-6"
                />
                <span className="text-xs md:text-base capitalize text-primary">
                  {car?.transmission}
                </span>
              </div>
            </div>

            {/* Tab Selectors */}
            <div className="relative bg-base-100 shadow-xs p-2 rounded-xl flex gap-6 mb-4 items-center justify-center w-full mt-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 relative rounded-xl p-2 text-sm md:text-base font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-white bg-secondary'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {/* {activeTab === tab && (
                    // <motion.div
                    //   layoutId="underline"
                    //   className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-primary"
                    //   transition={{
                    //     type: 'spring',
                    //     stiffness: 400,
                    //     damping: 30,
                    //   }}
                    // />
                  )} */}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-secondary">
                      <div className="flex items-center">
                        <img
                          src={sedan}
                          alt="Sedan"
                          className="inline mr-2 size-6"
                        />
                        <span className="text-sm  capitalize">
                          {car?.bodyType}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <img
                          src={mileage}
                          alt="Sedan"
                          className="inline mr-2 size-6"
                        />
                        <span className="text-sm text-secondary">
                          {car?.mileage}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <img
                          src={gas}
                          alt="Sedan"
                          className="inline mr-2 size-6"
                        />
                        <span className="text-sm capitalize">
                          {car?.fuelType}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <img
                          src={transmission}
                          alt="Sedan"
                          className="inline mr-2 size-6"
                        />
                        <span className="text-sm  capitalize">
                          {car?.transmission}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <img
                          src={date}
                          alt="Sedan"
                          className="inline mr-2 size-6"
                        />
                        <span className="text-sm ">{car?.year}</span>
                      </div>{' '}
                      <div className="flex items-center">
                        <UserRound className="inline mr-2 size-6" />
                        <span className="text-sm  capitalize">
                          {car?.condition}
                        </span>
                      </div>
                      <div className="flex items-center ">
                        <img
                          src={engine}
                          alt="Sedan"
                          className="inline mr-2 size-6"
                        />
                        <span className="text-sm  capitalize">
                          {car?.engineSize}L
                        </span>
                      </div>
                      <div className="flex items-center">
                        <img
                          src={cylinder}
                          alt="Sedan"
                          className="inline mr-2 size-6"
                        />
                        <span className="text-sm ">
                          {car?.cylinder} Cylinders
                        </span>
                      </div>
                      <div className="flex items-center">
                        <PaintBucket className="inline mr-2 size-6" />
                        <span className="text-sm ">{car?.color}</span>
                      </div>
                      <div className="flex items-center">
                        <img
                          src={door}
                          alt="Sedan"
                          className="inline mr-2 size-6"
                        />
                        <span className="text-sm ">{car?.door} Doors</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Description */}
                {activeTab === 'description' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-600">{car?.description}</p>
                  </div>
                )}
                {/* Features */}
                {activeTab === 'features' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Interior</h3>
                      <ul className="space-y-2">
                        {car?.interior.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full ">
                              <Check className="w-5 h-5 text-primary" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Exterior</h3>
                      <ul className="space-y-2">
                        {car?.exterior.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full ">
                              <Check className="size-5 text-primary" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Comfort</h3>
                      <ul className="space-y-2">
                        {car?.comfort.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full">
                              <Check className="size-5 text-primary" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Safety</h3>
                      <ul className="space-y-2">
                        {car?.safety.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full ">
                              <Check className="size-5 text-primary" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* Consolidated Forms Section */}

          <section id="dimensions" className="w-full my-8">
            <div className="bg-white p-6 py-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">
                Dimensions & Capacity
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="font-medium">Length</span>
                  <span className="text-gray-500">{car?.length} cm</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Width</span>
                  <span className="text-gray-500">{car?.width} cm</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Trunk Capacity</span>
                  <span className="text-gray-500">{car?.trunkCapacity} L</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Tire Size</span>
                  <span className="text-gray-500">{car?.tireSize}</span>
                </div>
              </div>
              {/* <div className="bg-white p-6 py-8 rounded-2xl shadow-xl"> */}
              <h2 className="text-2xl font-semibold my-8">
                Engine & Transmission
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="font-medium">Engine Capacity</span>
                  <span className="text-gray-500">{car?.engineSize} L</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Horsepower</span>
                  <span className="text-gray-500">{car?.horsepower}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Torque</span>
                  <span className="text-gray-500">{car?.torque} Nm</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">0-100 km/h</span>
                  <span className="text-gray-500">
                    {car?.zeroToHundred} sec
                  </span>
                </div>
              </div>
            </div>
            {/* </div> */}
          </section>
          <section id="reviews" className="w-full my-8">
            <div className="bg-white p-6 py-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold mb-2">Customer Reviews</h2>
              {/* <h1 className="font-medium mb-2">Very Good</h1> */}
              <div className="flex items-center justify-between space-x-2 my-2">
                <OverallRatingDisplay overallRating={averageRatings.overall} />
                <div className="grid grid-cols-2 gap-4 flex-2">
                  <div className="flex flex-col">
                    <span className="font-medium">Exterior</span>
                    <div className="flex items-center w-full">
                      <Star className="fill-primary stroke-0 size-4" />
                      <span className="text-gray-500">
                        {averageRatings.exterior}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Interior</span>
                    <div className="flex items-center w-full">
                      <Star className="fill-primary stroke-0 size-4" />
                      <span className="text-gray-500">
                        {averageRatings.interior}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Comfort</span>
                    <div className="flex items-center w-full">
                      <Star className="fill-primary stroke-0 size-4" />
                      <span className="text-gray-500">
                        {averageRatings.comfort}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Performance</span>
                    <div className="flex items-center w-full">
                      <Star className="fill-primary stroke-0 size-4" />
                      <span className="text-gray-500">
                        {averageRatings.performance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p>
                Based on{' '}
                <b>
                  {reviews.length} Review{reviews.length > 1 ? 's' : ''}
                </b>
              </p>
              <div className="flex flex-col space-y-6 mt-4">
                {reviews.map((review, index) => (
                  <Review key={index} review={review} />
                ))}
              </div>
              <h1 className="font-semibold text-xl mt-6">Leave a Review</h1>

              <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {ratingCategories.map((category) => (
                    <div key={category} className="flex flex-col gap-1">
                      <span className="font-medium">{category}</span>
                      <div className="flex w-full justify-start">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star1
                            key={rating}
                            filled={formData[category.toLowerCase()] >= rating}
                            onClick={() =>
                              handleRatingChange(category.toLowerCase(), rating)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleContentChange}
                    className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    rows="4"
                    placeholder=" "
                  />
                  <label
                    htmlFor="content"
                    className="absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Review Message
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full h-15 mt-2 text-white btn-primary btn-lg text-lg rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading
                    ? 'Submitting...'
                    : userReviewed
                    ? 'Update Review'
                    : 'Submit Review'}
                </button>
              </form>
            </div>
          </section>
          <section id="related-cars" className="w-full my-8">
            <h1 className="text-2xl font-bold">Related Cars</h1>
            <div className="flex overflow-x-auto w-full space-x-2 pl-1">
              {currentCar?.relatedCars.map((relatedCar) => (
                <CarCard
                  className="flex-shrink-0"
                  image={relatedCar.imageUrls[0]}
                  title={relatedCar.make + ' ' + relatedCar.model}
                  description={relatedCar.description}
                  mileage={{ icon: mileage, value: relatedCar.mileage }}
                  transmission={{
                    icon: transmission,
                    value: relatedCar.transmission,
                  }}
                  fuel={{ icon: gas, value: relatedCar.fuelType }}
                  year={{ icon: date, value: relatedCar.year }}
                  price={relatedCar.price}
                  dailyRate={relatedCar.dailyRate}
                  link={`/car/${relatedCar.id}`}
                />
              ))}
            </div>
            <div className="w-full flex justify-end pr-2">
              <button
                className="btn btn-primary btn-lg rounded-full"
                onClick={handleListingsClick}
              >
                View All
                <ArrowUpRight className="stroke-whitesize-5 ml-1" />
              </button>
            </div>
          </section>
        </div>
      </div>

      <div id="main-content desktop" className="hidden sm:block w-full">
        {/* <div className="bg-secondary h-16 w-full sticky top-0 z-50"></div> */}
        <div className="w-full max-w-5xl mx-auto px-4 mt-2">
          {/* <Breadcrumbs /> */}

          <section id="Hero" className="w-full my-4">
            <div className="flex w-full justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold">
                  {car?.make} {car?.model}
                </h1>
                <span className="text-gray-500">{car?.year}</span>

                <h1 className="text-2xl font-medium text-primary">
                  {formatPrice(car?.price)}
                </h1>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="flex-1 btn rounded-full border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-200"
                  onClick={() => handleShare()}
                >
                  <Share className="size-5 text-primary" /> Share
                </button>
                <button
                  onClick={handleCompareClick}
                  className="flex-1 btn rounded-full border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-200"
                >
                  <ArrowUpDown className="size-5 text-primary " /> Compare
                </button>
                <button className="flex-1 btn rounded-full border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-200">
                  <Bookmark className="size-5 text-primary" /> Save
                </button>
              </div>
            </div>
            <div className="relative flex justify-center items-center my-4 h-[70vh]">
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md shadow-lg border-0 rounded-full p-3 hover:scale-100 active:scale-100 transition-none"
                aria-label="Previous Image"
                onClick={prevImage}
              >
                <ChevronLeft className="size-6 text-white" />
              </button>

              <img
                src={car?.imageUrls[currentIndex]}
                alt="m4"
                className="rounded-xl w-full h-full object-cover"
              />

              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md shadow-lg border-0 rounded-full p-3 hover:scale-100 active:scale-100 transition-none"
                aria-label="Next Image"
                onClick={nextImage}
              >
                <ChevronRight className="size-6 text-white" />
              </button>
            </div>

            {/* Thumbnail Strip - Desktop */}
            {car?.imageUrls && car?.imageUrls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto mt-4 p-2 scrollbar-hide">
                {car.imageUrls.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      currentIndex === idx
                        ? 'border-primary shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
          <section id="key-specs" className="w-full my-8">
            {/* Key Specs */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 space-x-2 rounded-xl bg-white  shadow-sm flex justify-center items-center">
                <img src={mileage} alt="Mileage" className="size-6" />
                <span className="text-sm md:text-base text-primary">{car?.mileage} Km</span>
              </div>
              <div className="p-2 space-x-2 rounded-xl bg-white  shadow-sm flex justify-center items-center">
                <img src={gas} alt="Gas" className="size-6" />
                <span className="text-sm md:text-base capitalize text-primary">
                  {car?.fuelType}
                </span>
              </div>
              <div className="p-2 space-x-2 rounded-xl bg-white  shadow-sm flex justify-center items-center">
                <img
                  src={transmission}
                  alt="Transmission"
                  className="size-6"
                />
                <span className="text-sm md:text-base capitalize text-primary">
                  {car?.transmission}
                </span>
              </div>
            </div>

            <div className="mt-4 space-x-4 flex">
              <button
                className="btn btn-primary flex-1 h-15 rounded-xl font-bold text-lg"
                onClick={() =>
                  document.getElementById('test_drive_modal_1').showModal()
                }
              >
                Schedule a Test Drive
              </button>
              <dialog id="test_drive_modal_1" className="modal">
                <div className="modal-box bg-white p-6 py-8 rounded-xl shadow-xl">
                  <button
                    className="btn btn-circle bg-transparent border-0 shadow-none btn-sm absolute right-2 top-2"
                    onClick={() =>
                      document.getElementById('test_drive_modal_1').close()
                    }
                  >
                    <X className="size-5" />
                  </button>
                  <h2 className="text-2xl font-semibold mb-4">
                    Schedule a Test Drive
                  </h2>
                  <form action="" className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={testDriveFormData.name}
                        onChange={handleTestDriveChange}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder=" "
                      />
                      <label
                        htmlFor="name"
                        className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                          testDriveFormData.name && 'top-2 text-xs text-primary'
                        }`}
                      >
                        Your Name
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={testDriveFormData.email}
                        onChange={handleTestDriveChange}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder=" "
                      />
                      <label
                        htmlFor="email"
                        className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                          testDriveFormData.email &&
                          'top-2 text-xs text-primary'
                        }`}
                      >
                        Your Email
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={testDriveFormData.date}
                        onChange={handleTestDriveChange}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder=" "
                      />
                      <label
                        htmlFor="date"
                        className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                          testDriveFormData.date && 'top-2 text-xs text-primary'
                        }`}
                      >
                        Select Date
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-15 mt-2 text-white btn-primary btn-lg text-lg rounded-xl font-semibold"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </dialog>
              <button
                className="flex-1 btn btn-secondary w-full h-15 rounded-xl font-bold text-lg"
                onClick={() => document.getElementById('Contact-1').showModal()}
              >
                Contact Us
              </button>

              <dialog id="Contact-1" className="modal">
                <div className="modal-box bg-white p-6 py-8 rounded-xl shadow-xl">
                  <button
                    className="btn btn-circle bg-transparent border-0 shadow-none btn-sm absolute right-2 top-2"
                    onClick={() => document.getElementById('Contact-1').close()}
                  >
                    <X className="size-5" />
                  </button>
                  <h2 className="text-2xl font-semibold mb-4">
                    Contact Us Now!
                  </h2>
                  <div className="w-full flex justify-between my-4 space-x-2">
                    <button className="btn btn-lg bg-blue-500 rounded-full w-full flex-1 shadow-none border-none">
                      <Phone className="size-6 fill-white stroke-white" />
                    </button>
                    <button className="text-white btn btn-lg bg-green-500 rounded-full w-full flex-1 shadow-none border-none">
                      <img
                        src={whatsapp}
                        alt="WhatsApp"
                        className="size-6 fill-white stroke-white"
                      />
                    </button>
                  </div>
                  <form action="" className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={testDriveFormData.email}
                        onChange={handleTestDriveChange}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder=" "
                      />
                      <label
                        htmlFor="name"
                        className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                          testDriveFormData.name && 'top-2 text-xs text-primary'
                        }`}
                      >
                        Email
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        name="subject"
                        value={testDriveFormData.subject}
                        onChange={handleTestDriveChange}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder=" "
                      />
                      <label
                        htmlFor="email"
                        className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                          testDriveFormData.email &&
                          'top-2 text-xs text-primary'
                        }`}
                      >
                        Subject
                      </label>
                    </div>
                    <div className="relative">
                      <textarea
                        name="message"
                        value={testDriveFormData.message}
                        onChange={handleTestDriveChange}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder=" "
                      />
                      <label
                        htmlFor="message"
                        className={`absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary ${
                          testDriveFormData.message &&
                          'top-2 text-xs text-primary'
                        }`}
                      >
                        Message
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-15 mt-2 text-white btn-primary btn-lg text-lg rounded-xl font-semibold"
                    >
                      Send Us a Message
                    </button>
                  </form>
                </div>
              </dialog>
            </div>

            <div className="mt-8">
              <BookingWizard car={car} user={authUser} />
            </div>

            <div className="md:hidden block">
              {/* Tab Selectors */}
              <div className="shadow-xs rounded-xl p-2 bg-base-100 flex gap-6 mb-4 items-center justify-center w-full mt-8">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 relative rounded-xl p-2 text-sm md:text-base font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-white bg-secondary'
                        : 'text-gray-500 hover:text-primary'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {/* {activeTab === tab && (
                      <motion.div
                        layoutId="underline"
                        className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-primary"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )} */}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Overview */}
                  {activeTab === 'overview' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="grid grid-cols-2 gap-4 mt-2 text-secondary">
                        <div className="flex items-center">
                          <img
                            src={sedan}
                            alt="Sedan"
                            className="inline mr-2 size-6"
                          />
                          <span className="text-sm text-secondary capitalize">
                            {car?.bodyType}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={mileage}
                            alt="Sedan"
                            className="inline mr-2 size-6"
                          />
                          <span className="text-sm ">{car?.mileage}</span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={gas}
                            alt="Sedan"
                            className="inline mr-2 size-6"
                          />
                          <span className="text-sm  capitalize">
                            {car?.fuelType}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={transmission}
                            alt="Sedan"
                            className="inline mr-2 size-6"
                          />
                          <span className="text-sm  capitalize">
                            {car?.transmission}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={date}
                            alt="Sedan"
                            className="inline mr-2 size-6"
                          />
                          <span className="text-sm ">{car?.year}</span>
                        </div>{' '}
                        <div className="flex items-center">
                          <UserRound className="inline mr-2 size-6" />
                          <span className="text-sm  capitalize">
                            {car?.condition}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={engine}
                            alt="Sedan"
                            className="inline mr-2 size-6"
                          />
                          <span className="text-sm ">{car?.engineSize}L</span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={cylinder}
                            alt="Sedan"
                            className="inline mr-2 size-6"
                          />
                          <span className="text-sm ">
                            {car?.cylinder} Cylinders
                          </span>
                        </div>
                        <div className="flex items-center">
                          <PaintBucket className="inline mr-2 size-6" />
                          <span className="text-sm  capitalize">
                            {car?.color}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <img
                            src={door}
                            alt="Sedan"
                            className="inline mr-2 size-6"
                          />
                          <span className="text-sm ">{car?.door} Doors</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Description */}
                  {activeTab === 'description' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="text-gray-600">
                        {car?.description || 'No description available.'}
                      </p>
                    </div>
                  )}
                  {/* Features */}
                  {activeTab === 'features' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Interior</h3>
                        <ul className="space-y-2">
                          {car?.interior.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-gray-700"
                            >
                              <span className="flex items-center justify-center w-5 h-5 rounded-full">
                                <Check className="size-5 text-primary" />
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Exterior</h3>
                        <ul className="space-y-2">
                          {car?.exterior.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-gray-700"
                            >
                              <span className="flex items-center justify-center w-5 h-5 rounded-full ">
                                <Check className="w-5 h-5 text-primary" />
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Comfort</h3>
                        <ul className="space-y-2">
                          {car?.comfort.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-gray-700"
                            >
                              <span className="flex items-center justify-center w-5 h-5 rounded-full">
                                <Check className="w-5 h-5 text-primary" />
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Safety</h3>
                        <ul className="space-y-2">
                          {car?.safety.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-gray-700"
                            >
                              <span className="flex items-center justify-center w-5 h-5 rounded-full">
                                <Check className="size-5 text-primary" />
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex flex-col space-y-4 my-4 hidden md:block">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="grid grid-cols-4 gap-4 mt-2 text-secondary">
                  <div className="flex items-center">
                    <img
                      src={sedan}
                      alt="Sedan"
                      className="inline mr-2 size-6"
                    />
                    <span className="text-sm ">{car?.bodyType}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={mileage}
                      alt="Sedan"
                      className="inline mr-2 size-6"
                    />
                    <span className="text-sm ">{car?.mileage}</span>
                  </div>
                  <div className="flex items-center">
                    <img src={gas} alt="Sedan" className="inline mr-2 size-6" />
                    <span className="text-sm ">{car?.fuelType}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={transmission}
                      alt="Sedan"
                      className="inline mr-2 size-6"
                    />
                    <span className="text-sm ">{car?.transmission}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={date}
                      alt="Sedan"
                      className="inline mr-2 size-6"
                    />
                    <span className="text-sm ">{car?.year}</span>
                  </div>{' '}
                  <div className="flex items-center">
                    <UserRound className="inline mr-2 size-6" />
                    <span className="text-sm ">{car?.condition}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={engine}
                      alt="Sedan"
                      className="inline mr-2 size-6"
                    />
                    <span className="text-sm ">{car?.engineSize}L</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={cylinder}
                      alt="Sedan"
                      className="inline mr-2 size-6"
                    />
                    <span className="text-sm ">{car?.cylinder} Cylinders</span>
                  </div>
                  <div className="flex items-center">
                    <PaintBucket className="inline mr-2 size-6" />
                    <span className="text-sm ">{car?.color}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={door}
                      alt="Sedan"
                      className="inline mr-2 size-6"
                    />
                    <span className="text-sm ">{car?.door} Doors</span>
                  </div>
                </div>
              </div>
              <div className="">
                <h1 className="text-xl font-semibold">Description</h1>
                <p className="text-gray-600">
                  {car?.description || 'No description available.'}
                </p>
              </div>
              <hr className="border-t border-gray-300 my-8" />
              <div>
                <h1 className="text-xl font-semibold mb-2">Features</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Interior</h3>
                    <ul className="space-y-2">
                      {car?.interior.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full">
                            <Check className="size-5 text-primary" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Exterior</h3>
                    <ul className="space-y-2">
                      {car?.exterior.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full">
                            <Check className="size-5 text-primary" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Comfort</h3>
                    <ul className="space-y-2">
                      {car?.comfort.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full ">
                            <Check className="size-5 text-primary" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Safety</h3>
                    <ul className="space-y-2">
                      {car?.safety.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full">
                            <Check className="size-5 text-primary" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <hr className="border-t border-gray-300 my-8" />
            </div>
          </section>
          <section id="dimensions" className="w-full my-8">
            <h2 className="text-2xl font-semibold mb-4">
              Dimensions & Capacity
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <span className="font-medium">Length</span>
                <span className="text-gray-500">{car?.length} cm</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Width</span>
                <span className="text-gray-500">{car?.width} cm</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Trunk Capacity</span>
                <span className="text-gray-500">{car?.trunkCapacity} L</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Tire Size</span>
                <span className="text-gray-500">{car?.tireSize}</span>
              </div>
            </div>
            <hr className="border-t border-gray-300 my-8" />
            {/* <div className="bg-white p-6 py-8 rounded-2xl shadow-xl"> */}
            <h2 className="text-2xl font-semibold my-8">Engine Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <span className="font-medium">Engine Type</span>
                <span className="text-gray-500">{car?.engineSize} L</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Horsepower</span>
                <span className="text-gray-500">{car?.horsepower}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Torque</span>
                <span className="text-gray-500">{car?.torque} Nm</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">0-100 km/h</span>
                <span className="text-gray-500">{car?.zeroToHundred} sec</span>
              </div>
            </div>

            {/* </div> */}
          </section>
          <hr className="border-t border-gray-300 my-8" />
          <section id="reviews" className="w-full my-8">
            <h2 className="text-2xl font-semibold mb-2">Customer Reviews</h2>
            {/* <h1 className="font-medium mb-2">Very Good</h1> */}
            <div className="flex items-center justify-between space-x-4 my-2">
              <OverallRatingDisplay overallRating={averageRatings.overall} />
              <div className="grid grid-cols-2 gap-4 flex-2">
                <div className="flex w-full justify-between border-b-2 border-gray-300 pb-2">
                  <div>
                    <h1 className="font-medium">Exterior</h1>
                    <p className="text-gray-500">
                      {getRatingStatus(averageRatings.exterior)}
                    </p>
                  </div>

                  <div className="flex items-center ">
                    <Star className="fill-primary stroke-0 size-4" />
                    <span className="text-gray-500">
                      {averageRatings.exterior}
                    </span>
                  </div>
                </div>

                <div className="flex w-full justify-between border-b-2 border-gray-300 pb-2">
                  <div>
                    <h1 className="font-medium">Interior</h1>
                    <p className="text-gray-500">
                      {getRatingStatus(averageRatings.interior)}
                    </p>
                  </div>

                  <div className="flex items-center ">
                    <Star className="fill-primary stroke-0 size-4" />
                    <span className="text-gray-500">
                      {averageRatings.interior}
                    </span>
                  </div>
                </div>
                <div className="flex w-full justify-between border-b-2 border-gray-300 pb-2">
                  <div>
                    <h1 className="font-medium">Comfort</h1>
                    <p className="text-gray-500">
                      {getRatingStatus(averageRatings.comfort)}
                    </p>
                  </div>

                  <div className="flex items-center ">
                    <Star className="fill-primary stroke-0 size-4" />
                    <span className="text-gray-500">
                      {averageRatings.comfort}
                    </span>
                  </div>
                </div>
                <div className="flex w-full justify-between border-b-2 border-gray-300 pb-2">
                  <div>
                    <h1 className="font-medium">Performance</h1>
                    <p className="text-gray-500">
                      {getRatingStatus(averageRatings.performance)}
                    </p>
                  </div>

                  <div className="flex items-center ">
                    <Star className="fill-primary stroke-0 size-4" />
                    <span className="text-gray-500">
                      {averageRatings.performance}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p>
              Based on{' '}
              <b>
                {reviews.length} Review{reviews.length > 1 ? 's' : ''}
              </b>
            </p>
            <div className="flex flex-col space-y-6 mt-4">
              {reviews.map((review, index) => (
                <Review key={index} review={review} />
              ))}
            </div>
            <hr className="border-t border-gray-300 my-8" />
            <h1 className="font-semibold text-xl mt-6 mb-4">Leave a Review</h1>
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {ratingCategories.map((category) => (
                  <div key={category} className="flex flex-col gap-1">
                    <span className="font-medium">{category}</span>
                    <div className="flex w-full justify-start">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star1
                          key={rating}
                          filled={formData[category.toLowerCase()] >= rating}
                          onClick={() =>
                            handleRatingChange(category.toLowerCase(), rating)
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative">
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleContentChange}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  rows="4"
                  placeholder=" "
                />
                <label
                  htmlFor="content"
                  className="absolute left-3 transition-all duration-300 text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
                >
                  Review Message
                </label>
              </div>
              <button
                type="submit"
                className="w-full h-15 mt-2 text-white btn-primary btn-lg text-lg rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading
                  ? 'Submitting...'
                  : userReviewed
                  ? 'Update Review'
                  : 'Submit Review'}
              </button>
            </form>
          </section>
          <section id="related-cars" className="w-full my-8">
            <h1 className="text-2xl font-bold">Related Cars</h1>
            <div className="flex overflow-x-auto w-full space-x-2 pl-1">
              {currentCar?.relatedCars.map((relatedCar) => (
                <CarCard
                  className="flex-shrink-0"
                  image={relatedCar.imageUrls[0]}
                  title={relatedCar.make + ' ' + relatedCar.model}
                  description={relatedCar.description}
                  mileage={{ icon: mileage, value: relatedCar.mileage }}
                  transmission={{
                    icon: transmission,
                    value: relatedCar.transmission,
                  }}
                  fuel={{ icon: gas, value: relatedCar.fuelType }}
                  year={{ icon: date, value: relatedCar.year }}
                  price={relatedCar.price}
                  dailyRate={relatedCar.dailyRate}
                  link={`/car/${relatedCar.id}`}
                />
              ))}
            </div>
            <div className="w-full flex justify-end pr-2">
              <button
                className="btn btn-primary btn-lg rounded-full"
                onClick={handleListingsClick}
              >
                View All
                <ArrowUpRight className="stroke-whitesize-5 ml-1" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const OverallRatingDisplay = ({ overallRating }) => {
  // Define SVG properties
  const size = 180;
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate the stroke-dashoffset based on the rating
  // A rating of 5.0 means 0 offset (fully drawn circle)
  // A rating of 0 means full offset (empty circle)
  const offset = circumference - (overallRating / 5) * circumference;

  // Determine the color based on the rating value
  let strokeColor = '#9CA3AF'; // Gray-400
  let textColor = 'text-gray-500';

  if (overallRating > 0) {
    if (overallRating >= 4) {
      strokeColor = '#ff0000'; // Green-500
      textColor = '#f0c710';
    } else if (overallRating >= 3) {
      strokeColor = '#ff0000'; // Yellow-400
      textColor = '#f0c710';
    } else {
      strokeColor = '#ff0000'; // Rose-400
      // eslint-disable-next-line no-unused-vars
      textColor = '#f0c710';
    }
  }

  return (
    <div className="relative w-32 h-32 sm:w-44 sm:h-44 flex-shrink-0">
      {/* SVG Container */}
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle track */}
        <circle
          className="text-gray-200"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Dynamic progress circle with rounded ends */}
        <circle
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {/* Inner text content */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <span className={`text-3xl sm:text-4xl font-bold text-primary`}>
          {overallRating.toFixed(1)}
        </span>
        <span className="text-xs sm:text-sm font-medium text-primary">
          Out of 5.0
        </span>
      </div>
    </div>
  );
};

export default CarDetails;
