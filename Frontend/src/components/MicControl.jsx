import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { useEffect, useState } from "react";

const MicControl = () => {
   const [isMicOn, setIsMicOn] = useState(false);
   const [audioTrack, setAudioTrack] = useState(null);

   const requestMicAccess = async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         const track = stream.getAudioTracks()[0];
         setAudioTrack(track);
         setIsMicOn(true);
      } catch (error) {
         console.error("Error accessing microphone: ", error);
      }
   };

   const toggleMic = () => {
      if (isMicOn) {
         if (audioTrack) {
            audioTrack.stop();
            setAudioTrack(null);
         }
         setIsMicOn(false);
      } else {
         if (audioTrack) {
            setIsMicOn(true);
         } else {
            requestMicAccess();
         }
      }
   };

   useEffect(() => {
      return () => {
         if (audioTrack) {
            audioTrack.stop();
         }
      };
   }, [audioTrack]);

   return (
      <div className={`circle ${isMicOn ? 'bg-light' : 'bg-danger'} d-flex align-items-center justify-content-center`} onClick={toggleMic}>
         {isMicOn ? <IoMdMic size={20} /> : <IoMdMicOff size={20} />}
      </div>
   );
};

export default MicControl;