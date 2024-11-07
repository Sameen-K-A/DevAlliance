import { IoMdCamera } from "react-icons/io";
import { BiSolidCameraOff } from "react-icons/bi";

const CameraControl = ({toggleCamera, isCameraOn}) => {

   return (
      <div className={`circle ${isCameraOn ? 'bg-light' : 'bg-danger'} d-flex align-items-center justify-content-center`} onClick={toggleCamera}>
         {isCameraOn ? <IoMdCamera size={21} /> : <BiSolidCameraOff  size={20} fill="white" />}
      </div>
   );
};

export default CameraControl;