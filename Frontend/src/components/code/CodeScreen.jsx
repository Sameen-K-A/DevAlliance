import Editor from "@monaco-editor/react";
import LanguageSelection from "./LanguageSelection";
import { defaultCode } from "../../constants/defaultCode"

const CodeScreen = ({ selectedLanguage, setSelectedLanguage, enteredCode, setEnteredCode, canEditCode, canChangeLanguage }) => {
   return (
      <div className="screen d-flex align-items-center justify-content-center position-relative text-white p-1">
         <LanguageSelection selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} canChangeLanguage={canChangeLanguage} />
         <Editor
            className="mt-5"
            height="100%"
            width="100%"
            language={selectedLanguage}
            defaultValue={defaultCode[selectedLanguage]}
            value={enteredCode}
            onChange={(value) => setEnteredCode(value)}
            theme="vs-dark"
            options={{
               minimap: { enabled: false },
               readOnly: !canEditCode
            }}
         />
      </div>
   );
};

export default CodeScreen;