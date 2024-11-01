import { MdCallEnd } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contextAPI/Socket";
import MicControl from "./MicControl";
import ChatPanel from "./chat/ChatPanel";
import { IoMdShare } from "react-icons/io";
import stunServerConfig from "../../utils/stunServerConfig";
import CodeCopyModal from "./modals/CodeCopyModal";
import RoomMembersModal from "./modals/RoomMembersModal";
import LeaveModal from "./modals/LeaveModal";

const RoomControlPannel = ({ roomData, roomId, isHost, peerConnections, setPeerConnections, handleIsAudioTrackIsChanged }) => {
   const [showCodeCopyModal, setShowCodeCopyModal] = useState(false);
   const [showRoomMembersModal, setShowRoomMembersModal] = useState(false);
   const [showLeaveModal, setShowLeaveModal] = useState(false);
   const [roomMembers, setRoomMembers] = useState([]);
   const io = useSocket();
   const navigate = useNavigate();

   useEffect(() => {
      setRoomMembers(roomData?.members ? Object.keys(roomData.members) : []);

      if (io) {
         io.on("RoomClosed", () => { navigate("/", { state: { message: "Room closed" } }) });

         io.on("userJoined", (userId) => {
            setRoomMembers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
            const newUserPeerConnection = new RTCPeerConnection(stunServerConfig);

            console.log("new user enter")
            newUserPeerConnection.createOffer().then((offer) => {
               console.log("new user offer creating")
               return newUserPeerConnection.setLocalDescription(offer);
            }).then(() => {
               console.log("new user offer emited")
               io.emit('offer', { offer: newUserPeerConnection.localDescription, to: userId });
            })

            newUserPeerConnection.ontrack = (event) => {
               console.log('Received remote track', event);
               const [remoteAudioStream] = event.streams;
               const audioElement = new Audio();
               audioElement.srcObject = remoteAudioStream;
               audioElement.play().catch(e => console.error('Audio playback failed:', e));
            };

            newUserPeerConnection.onicecandidate = (event) => {
               console.log('New ICE candidate:', event.candidate);
               if (event.candidate) {
                  io.emit('ice-candidate', { candidate: event.candidate, to: userId });
               }
            };


            setPeerConnections((prevConnections) => ({ ...prevConnections, [userId]: newUserPeerConnection }));
            toast(`${userId} joined the room`);
         });

         io.on("userLeft", (userId) => {
            setRoomMembers((prevMembers) => prevMembers.filter((memberId) => memberId !== userId));
            setPeerConnections((prevConnections) => {
               const updatedConnections = { ...prevConnections };
               if (updatedConnections[userId]) {
                  updatedConnections[userId].close();
                  delete updatedConnections[userId];
               }
               return updatedConnections;
            });

            const audioElement = document.querySelector(`audio[data-user="${userId}"]`);
            if (audioElement) {
               audioElement.pause();
               audioElement.srcObject = null;
            }

            toast(`${userId} left the room`);
         });


         io.on("ice-candidate", ({ candidate, userId }) => {
            const peerConnection = peerConnections[userId];
            if (peerConnection) {
               peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
         });

         io.on("offer", ({ offer, from }) => {
            const peerConnection = peerConnections[from];
            if (peerConnection) {
               peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
                  return peerConnection.createAnswer();
               }).then((answer) => {
                  return peerConnection.setLocalDescription(answer);
               }).then(() => {
                  io.emit("answer", { answer: peerConnection.localDescription, to: from });
               });
            }
         });

         io.on("answer", ({ answer, from }) => {
            const peerConnection = peerConnections[from];
            if (peerConnection) {
               peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
         });

         return () => {
            io.off("ice-candidate");
            io.off("offer");
            io.off("answer");
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

            {showCodeCopyModal && <CodeCopyModal roomId={roomId} handleCopy={handleCopy} />}
            {showRoomMembersModal && <RoomMembersModal roomMembers={roomMembers} />}
            {showLeaveModal && <LeaveModal isHost={isHost} closeRoom={closeRoom} setShowLeaveModal={setShowLeaveModal} />}

            <div className="container-fluid d-flex align-items-center justify-content-between">
               <div className="d-flex justify-content-center gap-2 mx-auto">
                  <MicControl handleIsAudioTrackIsChanged={handleIsAudioTrackIsChanged} />
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
         <ChatPanel roomId={roomId} />
      </>
   );
};

export default RoomControlPannel;