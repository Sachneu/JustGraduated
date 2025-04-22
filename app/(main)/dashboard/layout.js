import React, { Suspense } from "react";
import { HashLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">
          Industry Insights
        </h1> 
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center mt-4">
            <HashLoader size={50} color="#36A2EB" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;