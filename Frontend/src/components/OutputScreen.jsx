import React, { useState } from 'react';
import { languages } from "../constants/languages";
import { Button } from '@mui/material';
import SkeletonUI from './SkeletonUI';
import axios from "axios";

const OutputScreen = ({ enteredCode, language }) => {
   const [isLoading, setIsLoading] = useState(false);
   const [output, setOutput] = useState("Click 'RUN' button to execute your code.");
   const [error, setError] = useState('');

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
               <Button variant="outlined" className='me-2' color="error" onClick={clearResult}>Clear</Button>
            )}
            <Button disabled={isLoading} variant="outlined" color="primary" onClick={handleRunCode} >Run</Button>
         </div>
         <div className="mt-5 px-5">
            {isLoading ? <SkeletonUI /> : <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{output}</p>}
            {error && <p className='text-danger'>{error}</p>}
         </div>
      </div>
   );
};

export default OutputScreen;