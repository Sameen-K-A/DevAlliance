import React, { useEffect, useState } from 'react';
import CodeScreen from '../components/CodeScreen';
import OutputScreen from '../components/OutputScreen';
import RoomControlPannel from '../components/ControlPanel';
import Navbar from '../components/Navbar';
import { defaultCode } from '../constants/defaultCode';

const CodeRoom = () => {

   const [enteredCode, setEnteredCode] = useState("");
   const [selectedLanguage, setSelectedLanguage] = useState("javascript");

   useEffect(() => {
      setEnteredCode(defaultCode[selectedLanguage]);
   }, [selectedLanguage]);

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
