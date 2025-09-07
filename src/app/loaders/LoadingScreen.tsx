import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {

  return (
    <div className="bg-secondary min-h-screen flex flex-col items-center justify-between p-4 font-sans">
      <div className="flex-grow flex items-center justify-center flex-col">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-opacity-30 flex items-center justify-center p-8">
          <div className="w-full h-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/gsrtclogo.png')" }}></div>
        </div>
        <p className="text-xl sm:text-3xl text-center font-bold text-primary">Gujarat State Road Transport Corporation</p>
        <p className="mt-4 text-lg sm:text-2xl text-center font-semibold text-orange-500">સલામત સવારી, એસટી અમારી</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
