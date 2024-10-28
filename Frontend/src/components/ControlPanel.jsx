import { MdCallEnd } from "react-icons/md";
import { IoMdMic, IoMdShare } from "react-icons/io";
import { FaUsers } from "react-icons/fa";

const RoomControlPannel = () => {
   return (
      <nav className="navbar fixed-bottom mb-2 mx-auto mt-2 control-panel">
         <div className="container-fluid d-flex align-items-center justify-content-between">
            <div className="d-flex justify-content-center gap-2 mx-auto">
               <div className="circle bg-light d-flex align-items-center justify-content-center"><IoMdMic size={20} /></div>
               <div className="circle bg-secondary d-flex align-items-center justify-content-center"><IoMdShare size={22} /></div>
               <div className="circle bg-primary d-flex align-items-center justify-content-center"><FaUsers size={22} fill="white"/></div>
               <div className="circle bg-danger d-flex align-items-center justify-content-center"><MdCallEnd fill="white" size={20} /></div>
            </div>
         </div>
      </nav>
   );
};

export default RoomControlPannel;