import { MdCallEnd } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { IoMdSettings, IoMdShare } from "react-icons/io";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contextAPI/Socket";
import MicControl from "./MicControl";
import ChatPanel from "./chat/ChatPanel";
import CodeCopyModal from "./modals/CodeCopyModal";
import RoomMembersModal from "./modals/RoomMembersModal";
import LeaveModal from "./modals/LeaveModal";
import SettingsModal from "./modals/SettingsModal";

const RoomControlPannel = ({ roomData, roomId, isHost, canEditCode, setCanEditCode, canChangeLanguage, setCanChangeLanguage, canClearOutput, setCanClearOutput, canRunCode, setCanRunCode }) => {

   const [activeModal, setActiveModal] = useState(null);
   const [roomMembers, setRoomMembers] = useState([]);
   const io = useSocket();
   const navigate = useNavigate();

   useEffect(() => {
      setRoomMembers(roomData?.members ? Object.keys(roomData.members) : []);

      if (io) {
         io.on("RoomClosed", () => { navigate("/", { state: { message: "Room closed" } }) });

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
            io.off("userJoined");
            io.off("userLeft");
         };
      }
   }, [io]);

   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(roomId);
         toast("Room code copied to clipboard.");
         setActiveModal(null);
      } catch (err) {
         toast("Failed to copy code.");
         console.error("Failed to copy: ", err);
      }
   };

   const openModal = (modalName) => {
      setActiveModal((prevModal) => (prevModal === modalName ? null : modalName));
   };

   const closeRoom = () => {
      io.emit("LeaveRoom", roomId);
      navigate("/");
   };

   return (
      <>
         <nav className="navbar fixed-bottom mb-2 mx-auto mt-2 control-panel" style={isHost ? { width: "270px" } : { width: "210px" }}>

            {activeModal === "codeCopy" && <CodeCopyModal roomId={roomId} handleCopy={handleCopy} />}
            {activeModal === "roomMembers" && <RoomMembersModal roomMembers={roomMembers} />}
            {activeModal === "leave" && <LeaveModal isHost={isHost} closeRoom={closeRoom} setShowLeaveModal={() => setActiveModal(null)} />}
            {activeModal === "settings" && (<SettingsModal
               canEditCode={canEditCode}
               setCanEditCode={setCanEditCode}
               canChangeLanguage={canChangeLanguage}
               setCanChangeLanguage={setCanChangeLanguage}
               canRunCode={canRunCode}
               setCanRunCode={setCanRunCode}
               canClearOutput={canClearOutput}
               setCanClearOutput={setCanClearOutput}
               roomId={roomId}
            />)}

            <div className="container-fluid d-flex align-items-center justify-content-between">
               <div className="d-flex justify-content-center gap-2 mx-auto">
                  <MicControl />
                  <div className="circle bg-secondary d-flex align-items-center justify-content-center" onClick={() => openModal("codeCopy")}>
                     <IoMdShare style={{ cursor: "pointer" }} size={22} fill="white" />
                  </div>
                  <div className="circle bg-primary d-flex align-items-center justify-content-center" onClick={() => openModal("roomMembers")}>
                     <FaUsers size={22} fill="white" />
                  </div>
                  {isHost && (
                     <div className="circle bg-secondary d-flex align-items-center justify-content-center" onClick={() => openModal("settings")}>
                        <IoMdSettings size={22} fill="white" />
                     </div>
                  )}
                  <div className="circle bg-danger d-flex align-items-center justify-content-center" onClick={() => openModal("leave")}>
                     <MdCallEnd fill="white" size={20} />
                  </div>
               </div>
            </div>
         </nav>
         <ChatPanel roomId={roomId} />
      </>
   );
};

export default RoomControlPannel;