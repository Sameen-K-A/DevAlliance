import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCaretBack } from "react-icons/io5";

const Page404 = () => {
   const navigate = useNavigate();

   return (
      <div className="not-found-wrapper d-flex justify-content-center align-items-center">
         <div className="not-found-container shadow-lg">
            <div className="console-header d-flex align-items-center p-2">
               <div className="dot red-dot me-2"></div>
               <div className="dot yellow-dot me-2"></div>
               <div className="dot green-dot"></div>
            </div>
            <div className="console-body p-4">
               <div className="error-message p-3 mb-4">
                  <p className="error-text">Error: 404 - Page Not Found</p>
                  <p className="info-text">The requested URL was not found on this server.</p>
                  <p className="info-text">Please check the URL or return to the previous page.</p>
                  <div className="error-stack">
                     <p className='m-0 mb-1'>at window.location (app:25)</p>
                     <p className='m-0 mb-1'>at fetchPage (router:32)</p>
                     <p className='m-0 mb-1'>at handleRequest (main:14)</p>
                  </div>
               </div>
               <button onClick={() => navigate(-1)} className="btn btn-danger d-flex justify-content-around align-items-center">
                  <IoCaretBack /> Go Back
               </button>
            </div>
         </div>
      </div>
   );
};

export default Page404;
