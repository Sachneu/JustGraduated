import React, { Suspense } from "react";
import { HashLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div className="px-5">
      
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