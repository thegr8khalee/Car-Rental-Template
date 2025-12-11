import { ArrowUpRight } from 'lucide-react';
import React from 'react';

const MakeCard = ({ img, label }) => {
  return (
    <div className="relative aspect-9/12 w-full">
      <img
        src={img}
        alt={label}
        className="absolute w-full h-full object-cover"
      />

      <h1 className="absolute text-white top-4 left-4 text-2xl drop-shadow-3xl  font-montserrat font-light">
        {label}
      </h1>
      <button className="absolute bottom-2 right-2 btn btn-circle btn-secondary">
        <ArrowUpRight className="text-white" />
      </button>
    </div>
  );
};

export default MakeCard;
