import React, { useEffect, useState, useCallback } from 'react';
import CodeScreen from "../components/code/CodeScreen";
import OutputScreen from '../components/code/OutputScreen';
import RoomControlPannel from '../components/code/ControlPanel';
import Navbar from '../components/common/Navbar';
import { useSocket } from '../contextAPI/Socket';
import lodash from 'lodash';
import { defaultCode } from '../constants/defaultCode';
import stunServerConfig from '../utils/stunServerConfig';

const CodeRoom = ({ roomData, isHost }) => {
   const [enteredCode, setEnteredCode] = useState(roomData?.currentCode);
   const [selectedLanguage, setSelectedLanguage] = useState(roomData?.language);
   const [peerConnections, setPeerConnections] = useState({});
   const roomId = roomData?.roomId;
   const io = useSocket();

   const emitCodeUpdate = useCallback(
      lodash.debounce((code) => {
         io.emit("CodeUpdation", { enteredCode: code, roomId });
      }, 1000),
      [io, roomId]
   );

   useEffect(() => {
      Object.values(roomData.members).forEach((memberId) => {
         if (!peerConnections[memberId]) {
            const userPeerConnection = new RTCPeerConnection(stunServerConfig);
            setPeerConnections((prevConnections) => ({ ...prevConnections, [memberId]: userPeerConnection, }));

            userPeerConnection.ontrack = (event) => {
               console.log('Received remote track', event);
               const [remoteAudioStream] = event.streams;
               const audioElement = new Audio();
               audioElement.srcObject = remoteAudioStream;
               audioElement.play().catch(e => console.error('Audio playback failed:', e));
            };

            userPeerConnection.onicecandidate = (event) => {
               console.log('New ICE candidate:', event.candidate);
               if (event.candidate) {
                  io.emit('ice-candidate', { candidate: event.candidate, to: memberId });
               }
            };

            userPeerConnection.createOffer().then((offer) => {
               return userPeerConnection.setLocalDescription(offer);
            }).then(() => {
               io.emit('offer', { offer: userPeerConnection.localDescription, to: memberId });
            })
         };
      });

      if (io && roomId) {
         io.on("UpdatedCode", (newCode) => setEnteredCode(newCode));
         io.on("UpdatedLanguage", (language) => setSelectedLanguage(language));

         return () => {
            roomId && io.emit("LeaveRoom", roomId);
            io.off("UpdatedCode");
            io.off("UpdatedLanguage");
            emitCodeUpdate.cancel();
            Object.values(peerConnections).forEach((peer) => (peer.close()));
            setPeerConnections({});
         };
      }
   }, []);

   useEffect(() => {
      if (io && roomId && enteredCode !== roomData.currentCode) {
         emitCodeUpdate(enteredCode);
      }
   }, [enteredCode, io, roomId]);

   useEffect(() => {
      if (io && roomId && selectedLanguage !== roomData.language) {
         io.emit("LanguageUpdation", { language: selectedLanguage, roomId });
         roomData.language = selectedLanguage;
         setEnteredCode(defaultCode[selectedLanguage]);
      }
   }, [selectedLanguage, io, roomId]);

   const handleIsAudioTrackIsChanged = (track) => {
      Object.values(peerConnections).forEach((peer) => {
         if (track) {
            peer.addTrack(track);
         } else {
            peer.getSenders().forEach((sender) => {
               if (sender.track?.kind === "audio") {
                  peer.removeTrack(sender);
               }
            })
         }
      })
   };

   return (
      <>
         <Navbar />
         <div className="d-flex justify-content-center gap-3 two-screens px-5 mt-4">
            <CodeScreen
               selectedLanguage={selectedLanguage}
               setSelectedLanguage={setSelectedLanguage}
               enteredCode={enteredCode}
               setEnteredCode={setEnteredCode}
            />
            <OutputScreen
               enteredCode={enteredCode}
               language={selectedLanguage}
               roomData={roomData}
               roomId={roomId}
            />
         </div>
         <RoomControlPannel
            roomData={roomData}
            roomId={roomId}
            isHost={isHost}
            peerConnections={peerConnections}
            setPeerConnections={setPeerConnections}
            handleIsAudioTrackIsChanged={handleIsAudioTrackIsChanged}
         />
      </>
   );
};

export default CodeRoom;