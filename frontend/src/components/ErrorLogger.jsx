import React from 'react';

const ErrorLogger = ({ error }) => {
  return (
    <div className="bg-red-500/20 text-red-500 p-4 rounded-3xl mb-6">
      <p className="text-sm">{error}</p>
    </div>
  );
};

export default ErrorLogger;
