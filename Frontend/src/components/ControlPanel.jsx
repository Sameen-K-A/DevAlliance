import { MdCallEnd } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { IoCopy } from "react-icons/io5";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../contextAPI/Socket";
import MicControl from "./MicControl";
import ChatPanel from "./ChatPanel";
import { IoMdShare } from "react-icons/io";

const RoomControlPannel = () => {
   const [roomId, setRoomId] = useState("ROOM_CODE");
   const [isHost, setIsHost] = useState(false);
   const [showCodeCopyModal, setShowCodeCopyModal] = useState(false);
   const [showRoomMembersModal, setShowRoomMembersModal] = useState(false);
   const [showLeaveModal, setShowLeaveModal] = useState(false);
   const [roomMembers, setRoomMembers] = useState([]);
   const location = useLocation();
   const io = useSocket();
   const navigate = useNavigate();

   useEffect(() => {
      if (location.state) {
         setRoomId(location.state.roomId || null);
         setIsHost(location.state.isHost || false);
      }

      if (io) {
         io.on("RoomClosed", () => {
            navigate("/", { state: { message: "Room closed" } });
         });
         io.on("roomData", (roomData) => {
            const roomMembers = Object.keys(roomData.members);
            setRoomMembers(roomMembers);
         });
         io.on("userJoined", (userId) => {
            setRoomMembers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
            toast(`${userId} joined the room`);
         });
         io.on("userLeft", (userId) => {
            setRoomMembers((prevMembers) => prevMembers.filter((memberId) => memberId !== userId));
            toast(`${userId} left the room`);
         });

         return () => {
            io.off("RoomClosed");
            io.off("roomData");
            io.off("userJoined");
            io.off("userLeft");
         };
      }
   }, [location.state, io]);

   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(roomId);
         toast("Room code copied to clipboard.");
         setShowCodeCopyModal(false);
      } catch (err) {
         toast("Failed to copy code.");
         console.error("Failed to copy: ", err);
      }
   };

   const toggleCodeCopyModal = () => {
      setShowCodeCopyModal((prev) => !prev);
      setShowRoomMembersModal(false);
      setShowLeaveModal(false);
   };

   const toggleRoomMembersModal = () => {
      setShowRoomMembersModal((prev) => !prev);
      setShowCodeCopyModal(false);
      setShowLeaveModal(false);
   };

   const toggleLeaveModal = () => {
      setShowLeaveModal((prev) => !prev);
      setShowCodeCopyModal(false);
      setShowRoomMembersModal(false);
   };

   const closeRoom = () => {
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

            {showRoomMembersModal && (
               <div className="members-list px-3 pt-2">
                  {roomMembers.map((member, index) => (
                     <div key={index} className="d-flex align-items-center mb-2">
                        <div className="circle bg-secondary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }} />
                        <p className="text-light m-0" style={{ whiteSpace: 'nowrap' }}>{member}</p>
                     </div>
                  ))}
               </div>
            )}

            {showLeaveModal && (
               <div className="leave-modal px-3 py-3">
                  <h6 className="text-light p-0 m-0 text-center mb-3" style={{ whiteSpace: "nowrap" }}>Are you sure you want to exit the room?</h6>
                  <p className="text-light text-center">{isHost && "Please note, as the host, leaving will close the room for everyone."}</p>
                  <div className="d-flex gap-2 justify-content-center align-items-center">
                     <button className="btn bg-secondary text-light" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                     <button className="btn bg-danger text-light" onClick={closeRoom}>Leave</button>
                  </div>
               </div>
            )}

            <div className="container-fluid d-flex align-items-center justify-content-between">
               <div className="d-flex justify-content-center gap-2 mx-auto">
                  <MicControl />
                  <div className="circle bg-secondary d-flex align-items-center justify-content-center" onClick={toggleCodeCopyModal}>
                     <IoMdShare style={{ cursor: "pointer" }} size={22} fill="white" />
                  </div>
                  <div className="circle bg-primary d-flex align-items-center justify-content-center" onClick={toggleRoomMembersModal}>
                     <FaUsers size={22} fill="white" />
                  </div>
                  <div className="circle bg-danger d-flex align-items-center justify-content-center" onClick={toggleLeaveModal}>
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