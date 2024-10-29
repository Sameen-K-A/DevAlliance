import { MdCallEnd } from "react-icons/md";
import { IoMdMic, IoMdShare } from "react-icons/io";
import { FaUsers } from "react-icons/fa";
import { IoCopy } from "react-icons/io5";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../contextAPI/Socket";
import ChatPanel from "./ChatPanel";

const RoomControlPannel = () => {
   const [roomId, setRoomId] = useState("ROOM_CODE");
   const [isHost, setIsHost] = useState(false);
   const [showCodeCopyModal, setShowCodeCopyModal] = useState(false);
   const location = useLocation();
   const io = useSocket();
   const navigate = useNavigate();

   useEffect(() => {
      if (location.state?.roomId) {
         setRoomId(location.state.roomId);
      } else if (location.state?.isHost) {
         setIsHost(true)
      };

      if (io) {
         io.on("RoomClosed", () => {
            navigate("/", { state: { message: "Room closed" } });
         });

         return () => {
            io.off("RoomClosed");
         };
      }
   }, []);

   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(roomId);
         toast("Room code copied to clipboard.");
         setShowCodeCopyModal(false);
      } catch (err) {
         toast("Failed copy code.");
         console.error("Failed to copy: ", err);
      }
   };

   const closeRoom = () => {
      if (isHost) {
         console.log("You are the room host that because room will automatically closed")
      };
      io.emit("LeaveRoom", roomId);
      navigate("/");
   };

   return (
      <>
         <nav className="navbar fixed-bottom mb-2 mx-auto mt-2 control-panel">
            {showCodeCopyModal && (
               <div className="code-share">
                  <p className="text-light m-0">{roomId}</p>
                  <IoCopy fill="#c4c4c4" onClick={handleCopy} style={{ cursor: 'pointer' }} />
               </div>
            )}

            <div className="container-fluid d-flex align-items-center justify-content-between">
               <div className="d-flex justify-content-center gap-2 mx-auto">
                  <div className="circle bg-light d-flex align-items-center justify-content-center">
                     <IoMdMic size={20} />
                  </div>
                  <div className="circle bg-secondary d-flex align-items-center justify-content-center" onClick={() => setShowCodeCopyModal(prev => !prev)}>
                     <IoMdShare style={{ cursor: "pointer" }} size={22} fill="white" />
                  </div>
                  <div className="circle bg-primary d-flex align-items-center justify-content-center">
                     <FaUsers size={22} fill="white" />
                  </div>
                  <div className="circle bg-danger d-flex align-items-center justify-content-center" onClick={closeRoom}>
                     <MdCallEnd fill="white" size={20} />
                  </div>
               </div>
            </div>
         </nav>
         <ChatPanel />
      </>
   );
};

export default RoomControlPannel;