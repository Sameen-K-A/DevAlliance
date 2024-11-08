import React, { useEffect, useState, useCallback } from 'react';
import CodeScreen from "../components/code/CodeScreen";
import OutputScreen from '../components/code/OutputScreen';
import RoomControlPannel from '../components/code/ControlPanel';
import { useSocket } from '../contextAPI/Socket';
import lodash from 'lodash';
import { defaultCode } from '../constants/defaultCode';

const CodeRoom = ({ roomData, isHost }) => {
   const [enteredCode, setEnteredCode] = useState(roomData?.currentCode);
   const [selectedLanguage, setSelectedLanguage] = useState(roomData?.language);
   const [canEditCode, setCanEditCode] = useState(roomData?.canEditCode);
   const [canChangeLanguage, setCanChangeLanguage] = useState(roomData?.canChangeLanguage);
   const [canRunCode, setCanRunCode] = useState(roomData?.canRunCode);
   const [canClearOutput, setCanClearOutput] = useState(roomData?.canClearOutput);

   const roomId = roomData?.roomId;
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

         io.on("settingsUpdated", ({ settingName, value }) => {
            switch (settingName) {
               case "canEditCode":
                  setCanEditCode(value);
                  break;
               case "canChangeLanguage":
                  setCanChangeLanguage(value);
                  break;
               case "canRunCode":
                  setCanRunCode(value);
                  break;
               case "canClearOutput":
                  setCanClearOutput(value);
                  break;
               default:
                  break;
            }
         });

         return () => {
            roomId && io.emit("LeaveRoom", roomId);
            io.off("UpdatedCode");
            io.off("UpdatedLanguage");
            io.off("settingsUpdated");
            emitCodeUpdate.cancel();
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

   return (
      <>
         <div className="d-flex justify-content-center gap-3 two-screens px-5 mt-4">
            <CodeScreen
               selectedLanguage={selectedLanguage}
               setSelectedLanguage={setSelectedLanguage}
               enteredCode={enteredCode}
               setEnteredCode={setEnteredCode}
               canEditCode={isHost ? true : (canEditCode ? true : false)}
               canChangeLanguage={isHost ? true : (canChangeLanguage ? true : false)}
            />
            <OutputScreen
               enteredCode={enteredCode}
               language={selectedLanguage}
               roomData={roomData}
               roomId={roomId}
               canClearOutput={isHost ? true : (canClearOutput ? true : false)}
               canRunCode={isHost ? true : (canRunCode ? true : false)}
            />
         </div>
         <RoomControlPannel
            roomData={roomData}
            roomId={roomId}
            isHost={isHost}
            canEditCode={canEditCode}
            setCanEditCode={setCanEditCode}
            canChangeLanguage={canChangeLanguage}
            setCanChangeLanguage={setCanChangeLanguage}
            canClearOutput={canClearOutput}
            setCanClearOutput={setCanClearOutput}
            canRunCode={canRunCode}
            setCanRunCode={setCanRunCode}
         />
      </>
   );
};

export default CodeRoom;