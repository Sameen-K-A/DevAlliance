import { useEffect, useState } from "react";

const Navbar = () => {

   const [isLogged, setIsLogged] = useState(true);
   useEffect(() => {
      const localData = localStorage.getItem('userIsLogged');
      if (localData) {
         setIsLogged(true);
      };
   }, []);

   return (
      <nav className="navbar navbar-expand-lg mx-auto mt-4 py-3">
         <div className="container-fluid d-flex justify-content-between align-items-center">
            <a className="navbar-brand ms-3">
               DevAlliance
            </a>
            {isLogged ? (
               <div className="circle bg-secondary me-2"></div>
            ) : (
               <button className="btn bg-light me-3">Login</button>
            )}
         </div>
      </nav>
   );
};

export default Navbar;