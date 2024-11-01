import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MicControl = ({ handleIsAudioTrackIsChanged }) => {
   const [isMicOn, setIsMicOn] = useState(false);
   const [audioTrack, setAudioTrack] = useState(null);

   const requestMicAccess = async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
         const track = stream.getAudioTracks()[0];
         setAudioTrack(track);
         setIsMicOn(true);
         handleIsAudioTrackIsChanged(track)
      } catch (error) {
         toast("Allow the permission for accessing mic.")
      }
   };

   const toggleMic = () => {
      if (isMicOn) {
         if (audioTrack) {
            audioTrack.stop();
            setAudioTrack(null);
            handleIsAudioTrackIsChanged(null)
         }
         setIsMicOn(false);
      } else {
         if (audioTrack) {
            setIsMicOn(true);
            handleIsAudioTrackIsChanged(audioTrack)
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