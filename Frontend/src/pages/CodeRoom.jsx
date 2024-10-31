import React, { useEffect, useState, useCallback } from 'react';
import CodeScreen from "../components/code/CodeScreen";
import OutputScreen from '../components/code/OutputScreen';
import RoomControlPannel from '../components/code/ControlPanel';
import Navbar from '../components/common/Navbar';
import { useSocket } from '../contextAPI/Socket';
import lodash from 'lodash';
import { defaultCode } from '../constants/defaultCode';

const CodeRoom = ({ roomData, isHost }) => {
   const [enteredCode, setEnteredCode] = useState(roomData?.currentCode);
   const [selectedLanguage, setSelectedLanguage] = useState(roomData?.language);
   const [roomId, setRoomId] = useState(roomData?.roomId);
   const io = useSocket();

   const emitCodeUpdate = useCallback(
      lodash.debounce((code) => {
         io.emit("CodeUpdation", { enteredCode: code, roomId });
      }, 1000),
      [io, roomId]
   );

   useEffect(() => {
      if (io && roomId) {
         io.on("UpdatedCode", (newCode) => setEnteredCode(newCode));
         io.on("UpdatedLanguage", (language) => setSelectedLanguage(language));

         return () => {
            if (roomId) io.emit("LeaveRoom", roomId);
            io.off("UpdatedCode");
            io.off("UpdatedLanguage");
            emitCodeUpdate.cancel();
         };
      }
   }, [io, roomId, emitCodeUpdate]);

   useEffect(() => {
      if (io && roomId) {
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
         />
      </>
   );
};

export default CodeRoom;