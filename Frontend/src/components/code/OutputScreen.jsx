import React, { useEffect, useState } from 'react';
import { languages } from "../../constants/languages";
import { Button } from '@mui/material';
import SkeletonUI from '../common/SkeletonUI';
import axios from "axios";
import { useSocket } from '../../contextAPI/Socket';

const OutputScreen = ({ enteredCode, language, roomData, roomId, canRunCode, canClearOutput }) => {
   const [isLoading, setIsLoading] = useState(false);
   const [output, setOutput] = useState(roomData.output || "Click 'RUN' to execute your code.");
   const [error, setError] = useState(roomData.error || '');
   const io = useSocket();

   useEffect(() => {
      if (io) {
         io.emit("OutputUpdation", { output, roomId })
      }
   }, [output]);

   useEffect(() => {
      if (io) {
         io.emit("ErrorUpdation", { error, roomId })
      }
   }, [error]);

   useEffect(() => {
      if (io) {
         io.on("UpdatedOutput", (output) => setOutput(output));
         io.on("UpdatedError", (error) => setError(error));
      };

      return () => {
         if (io) {
            io.off("UpdatedOutput");
            io.off("UpdatedError");
         };
      };
   }, [])

   const handleRunCode = async () => {
      try {
         setIsLoading(true);
         const response = await axios.post(import.meta.env.VITE_EXECUTE_URL, {
            "language": language,
            "version": languages[language],
            "files": [{ "content": enteredCode }]
         });
         const { stderr, stdout } = response.data.run;
         setOutput(stdout);
         setError(stderr);
      } catch (error) {
         console.error("Error executing code:", error);
         setError("An error occurred while executing the code.");
      } finally {
         setIsLoading(false);
      }
   };

   const clearResult = () => {
      setOutput('');
      setError('');
   }

   return (
      <div className="screen position-relative">
         <div className="position-absolute top-0 end-0 mt-2 me-2">
            {(output || error) && (
               <Button variant="contained" disabled={!canClearOutput} className='me-2' color="error" onClick={clearResult}>Clear</Button>
            )}
            <Button disabled={isLoading || !canRunCode} variant="contained" color="primary" onClick={handleRunCode} >Run</Button>
         </div>
         <div className="mt-5 px-5">
            {isLoading ? <SkeletonUI /> : <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{output}</p>}
            {error && <p className='text-danger'>{error}</p>}
         </div>
      </div>
   );
};

export default OutputScreen;