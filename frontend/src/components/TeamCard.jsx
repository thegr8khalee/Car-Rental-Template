import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, MailIcon } from 'lucide-react';

const TeamCard = ({ image, name, title, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's "sm" = 640px
    };
    handleResize(); // run once
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`group flex-shrink-0 relative w-68 h-90 rounded-2xl shadow-lg overflow-hidden cursor-pointer`}
      onClick={() => isMobile && setIsOpen(!isOpen)} // only allow click on mobile
    >
      {/* Image */}
      <img
        src={image}
        alt={name}
        className="absolute object-cover w-full h-full rounded-2xl"
      />

      {/* Gradient overlay always visible */}
      <div className="absolute bottom-0 left-0 h-full w-full bg-gradient-to-t from-black to-transparent opacity-50 rounded-2xl"></div>

      {/* Bottom preview text */}
      <div className="absolute bottom-4 left-4 z-10 w-full pr-8">
        <div className="flex w-full justify-between items-end">
          <div>
            <h1 className="text-white font-bold text-xl font-inter">
              {name}
            </h1>
            <p className="text-white font-medium font-inter">{title}</p>
          </div>
          <div>
            <ChevronUp className="text-white sm:hidden" />
          </div>
        </div>
      </div>

      {/* Overlay (hover on desktop, click on mobile) */}
      <div
        className={`absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-primary to-secondary rounded-2xl transform transition-transform duration-500 ease-in-out z-20 
          ${
            isMobile
              ? isOpen
                ? 'translate-y-0'
                : 'translate-y-full'
              : 'group-hover:translate-y-0 translate-y-full'
          }`}
      >
        <div
          className={`absolute h-full flex flex-col justify-between top-0 left-0 w-full p-4 z-30 transform transition-transform duration-500 ease-in-out 
            ${
              isMobile
                ? isOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-full opacity-0'
                : 'group-hover:translate-y-0 group-hover:opacity-100 translate-y-full opacity-0'
            }`}
        >
          <div>
            <h1 className="text-white font-bold text-xl font-inter">
              {name}
            </h1>
            <p className="text-white font-medium font-inter">{title}</p>
            <p className="text-white text-sm font-inter mt-2 font-light">
              {description}
            </p>
          </div>
          <div className="w-full flex justify-between">
            <MailIcon className="text-white" />
            <ChevronDown className="text-white sm:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
