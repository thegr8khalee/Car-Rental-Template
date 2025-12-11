import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';

const SlidingImageCarousel = ({ car }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Extract images from car data
  const images = car?.imageUrls?.map(img => 
    typeof img === 'object' ? img.url : img
  ) || [];

  const prevImage = () => {
    if (isTransitioning || images.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const nextImage = () => {
    if (isTransitioning || images.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Auto-slide functionality (optional)
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextImage();
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isTransitioning, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!car?.imageUrls || car.imageUrls.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-lg">No Images Available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-xl bg-gray-900 shadow-2xl">
      {/* Image Container with Sliding Effect */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${images.length * 100}%`
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0 relative"
            style={{ width: `${100 / images.length}%` }}
          >
            <img
              src={image}
              alt={`${car.make} ${car.model} - Image ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            
            {/* Image overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle bg-white/80 backdrop-blur-md shadow-lg border-0 hover:bg-white/90 disabled:opacity-50 transition-all duration-200"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            onClick={nextImage}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle bg-white/80 backdrop-blur-md shadow-lg border-0 hover:bg-white/90 disabled:opacity-50 transition-all duration-200"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Video Button */}
      <button
        className="absolute left-4 bottom-4 btn rounded-full shadow-lg bg-black/80 text-white border-0 hover:bg-black/90 backdrop-blur-md transition-all duration-200"
        aria-label="Play Video"
      >
        <Video className="w-5 h-5 mr-2" />
        Video
      </button>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && images.length <= 8 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'bg-white scale-110 shadow-lg'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar for Many Images */}
      {images.length > 8 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
          />
        </div>
      )}

      {/* Touch/Swipe Indicators */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left swipe area */}
        <div 
          className="absolute left-0 top-0 w-1/3 h-full pointer-events-auto cursor-w-resize"
          onClick={prevImage}
        />
        {/* Right swipe area */}
        <div 
          className="absolute right-0 top-0 w-1/3 h-full pointer-events-auto cursor-e-resize"
          onClick={nextImage}
        />
      </div>
    </div>
  );
};

export default SlidingImageCarousel;
