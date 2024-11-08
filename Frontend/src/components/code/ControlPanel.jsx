import { MdCallEnd } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { IoMdSettings, IoMdShare } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../../contextAPI/Socket";
import MicControl from "./MicControl";
import CameraControl from "./CameraControl";
import ChatPanel from "./chat/ChatPanel";
import CodeCopyModal from "./modals/CodeCopyModal";
import RoomMembersModal from "./modals/RoomMembersModal";
import LeaveModal from "./modals/LeaveModal";
import SettingsModal from "./modals/SettingsModal";
import VideoPanel from "./VideoPanel";
import AgoraRTC from "agora-rtc-sdk-ng";

const RoomControlPannel = ({ roomData, roomId, isHost, canEditCode, setCanEditCode, canChangeLanguage, setCanChangeLanguage, canClearOutput, setCanClearOutput, canRunCode, setCanRunCode }) => {

   const [activeModal, setActiveModal] = useState(null);
   const [roomMembers, setRoomMembers] = useState([]);
   const videoContainerRef = useRef();
   const [isCameraOn, setIsCameraOn] = useState(false);
   const [isMicOn, setIsMicOn] = useState(false);
   const io = useSocket();
   const navigate = useNavigate();
   const [localTrack, setLocalTrack] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const location = useLocation();

   useEffect(() => {
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      const uid = location.state?.name ? location.state.name : Math.floor(Math.random() * 10000);
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      const remoteUsers = {};

      async function joinRoom() {
         await client.join(appId, roomId, null, uid)
         client.on("user-published", handleUserPublished);
         client.on("user-left", handleUserLeft);
         await joinStream();
      }

      async function joinStream() {
         try {
            const userMedia = await AgoraRTC.createMicrophoneAndCameraTracks({}, {
               encoderConfig: {
                  width: { min: 640, ideal: 1920, max: 1920 },
                  height: { min: 480, ideal: 1080, max: 1080 }
               }
            });
            setIsMicOn(true);
            setIsCameraOn(true);
            setLocalTrack(userMedia)

            const videoPlayer = `<div id="video-circle-${uid}">
                                    <div class="video-square" id="player-${uid}"></div>
                                    <div class="video-uid">${uid}</div>
                                 </div>`;
            videoContainerRef.current?.insertAdjacentHTML("beforeend", videoPlayer);
            userMedia[1].play(`player-${uid}`);
            await client.publish(userMedia);
         } catch (error) {
            setIsMicOn(false);
            setIsCameraOn(false);
            console.error("Error during stream join or user reject the access the mic and camera:", error);
         } finally {
            setIsLoading(false);
         }
      }

      async function handleUserPublished(user, mediaType) {
         remoteUsers[user.uid] = user;
         await client.subscribe(user, mediaType);
         if (!document.getElementById(`video-circle-${user.uid}`)) {
            const videoPlayer = `<div id="video-circle-${user.uid}" class="remote-video">
                                    <div class="video-square" id="player-${user.uid}"></div>
                                    <div class="video-uid">${user.uid}</div>
                                 </div>`;
            videoContainerRef.current?.insertAdjacentHTML("beforeend", videoPlayer);
         }

         if (mediaType === "video" && user.videoTrack) {
            user.videoTrack.play(`player-${user.uid}`);
         }
         if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
         }
      }

      const handleUserLeft = (user) => {
         delete remoteUsers[user.uid]
         document.getElementById(`video-circle-${user.uid}`)?.remove();
      };

      joinRoom();

      return () => {
         client.leave();
         client.off("user-published", handleUserPublished);
         client.off("user-left", handleUserLeft);
         localTrack.forEach(track => track.close());
      };

   }, []);

   useEffect(() => {
      setRoomMembers(roomData?.members ? Object.values(roomData.members) : []);

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

   const toggleCamera = async () => {
      if (isLoading) {
         toast("Please wait camera accessing on process");
         return;
      }
      if (localTrack[1]) {
         if (localTrack[1].muted) {
            await localTrack[1].setMuted(false);
            setIsCameraOn(true);
         } else {
            await localTrack[1].setMuted(true);
            setIsCameraOn(false);
         }
      } else {
         toast("Allow your camera access.")
      }
   };

   const toggleMic = async () => {
      if (isLoading) {
         toast("Please wait microphone accessing on process");
         return;
      }
      if (localTrack[0]) {
         if (localTrack[0].muted) {
            await localTrack[0].setMuted(false);
            setIsMicOn(true);
         } else {
            await localTrack[0].setMuted(true);
            setIsMicOn(false);
         }
      } else {
         toast("Allow your microphone access.")
      }
   };

   return (
      <>
         <VideoPanel videoContainerRef={videoContainerRef} />
         <nav className="navbar fixed-bottom mb-2 mx-auto mt-2 control-panel" style={isHost ? { width: "320px" } : { width: "260px" }}>

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
                  <CameraControl toggleCamera={toggleCamera} isCameraOn={isCameraOn} />
                  <MicControl toggleMic={toggleMic} isMicOn={isMicOn} />
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