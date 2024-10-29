import React, { useEffect, useState } from 'react';
import CodeScreen from '../components/CodeScreen';
import OutputScreen from '../components/OutputScreen';
import RoomControlPannel from '../components/ControlPanel';
import Navbar from '../components/Navbar';
import { defaultCode } from '../constants/defaultCode';
import { useSocket } from '../contextAPI/Socket';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const CodeRoom = () => {
   const [enteredCode, setEnteredCode] = useState("");
   const [selectedLanguage, setSelectedLanguage] = useState("javascript");
   const [roomId, setRoomId] = useState("");
   const location = useLocation();
   const io = useSocket();

   useEffect(() => {
      setEnteredCode(defaultCode[selectedLanguage]);
      if (io) {
         io.emit("LanguageUpdation", { language: selectedLanguage, roomId });
      }
   }, [selectedLanguage]);

   useEffect(() => {
      if (io && roomId) {
         io.emit("CodeUpdation", { enteredCode, roomId });
      }
   }, [enteredCode, io, roomId]);

   useEffect(() => {
      if (location.state?.roomId) {
         setRoomId(location.state.roomId);
      }
      if (io) {
         io.on("userJoined", (userId) => {
            toast(`${userId} joined into the room`);
         });
         io.on("userLeft", (userId) => {
            toast(`${userId} Left from the room`);
         });
         io.on("roomData", (roomData) => {
            setEnteredCode(roomData.currentCode);
            setSelectedLanguage(roomData.language);
         });
         io.on("UpdatedCode", (newCode) => {
            setEnteredCode(newCode);
         });
         io.on("UpdatedLanguage", (language) => {
            setSelectedLanguage(language);
         });

         return () => {
            if (roomId) {
               io.emit("LeaveRoom", roomId);
            }
            io.off("userJoined");
            io.off("userLeft");
            io.off("UpdatedCode");
            io.off("UpdatedLanguage");
            io.off("roomData");
         };
      }
   }, []);

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
            />
         </div>
         <RoomControlPannel />
      </>
   );
};

export default CodeRoom;