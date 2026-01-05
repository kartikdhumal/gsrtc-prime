import React from 'react';

const Loader = () => {
  return (
    <div className="bg-primary min-h-screen flex items-center justify-center font-sans overflow-hidden">
      <style>
        {`
          .double-ring-loader {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 8px solid transparent;
            border-top-color: #212153;
            border-right-color: #212153;
            animation: spin-loader 0.8s linear infinite;
            position: relative;
          }

          .double-ring-loader::before {
            content: '';
            position: absolute;
            top: 6px;
            left: 6px;
            right: 6px;
            bottom: 6px;
            border-radius: 50%;
            border: 8px solid transparent;
            border-top-color: #212153;
            animation: spin-loader 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
          }

          @keyframes spin-loader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div className="relative double-ring-loader"></div>
    </div>
  );
};

export default Loader;
