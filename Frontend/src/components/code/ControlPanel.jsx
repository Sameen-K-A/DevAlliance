import { MdCallEnd } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { IoCopy } from "react-icons/io5";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contextAPI/Socket";
import MicControl from "./MicControl";
import ChatPanel from "./chat/ChatPanel";
import { IoMdShare } from "react-icons/io";

const RoomControlPannel = ({ roomData, roomId, isHost }) => {
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