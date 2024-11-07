import { IoMdMic, IoMdMicOff } from "react-icons/io";

const MicControl = ({toggleMic, isMicOn}) => {

   return (
      <div className={`circle ${isMicOn ? 'bg-light' : 'bg-danger'} d-flex align-items-center justify-content-center`} onClick={toggleMic}>
         {isMicOn ? <IoMdMic size={20} /> : <IoMdMicOff size={20} fill="white" />}
      </div>
   );
   
};

export default MicControl;