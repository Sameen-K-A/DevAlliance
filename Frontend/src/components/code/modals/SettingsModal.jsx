import { useSocket } from "../../../contextAPI/Socket";

const SettingsModal = ({
   canEditCode, setCanEditCode,
   canChangeLanguage, setCanChangeLanguage,
   canRunCode, setCanRunCode,
   canClearOutput, setCanClearOutput,
   roomId
}) => {

   const io = useSocket();
   const handleSettingChange = (settingName, newValue, setFunction) => {
      setFunction(newValue)
      io.emit("updateSettings", { roomId, settingName, value: newValue });
   };

   return (
      <div className="members-list px-3 pt-2 text-white">

         <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="me-2" style={{ whiteSpace: 'nowrap' }}>Allow room members to edit the code</span>
            <div className="form-check form-switch">
               <input type="checkbox" className="form-check-input" checked={canEditCode} onChange={() => handleSettingChange("canEditCode", !canEditCode, setCanEditCode)} />
            </div>
         </div>

         <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="me-2" style={{ whiteSpace: 'nowrap' }}>Allow room members to change the language</span>
            <div className="form-check form-switch">
               <input type="checkbox" className="form-check-input" checked={canChangeLanguage} onChange={() => handleSettingChange("canChangeLanguage", !canChangeLanguage, setCanChangeLanguage)} />
            </div>
         </div>

         <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="me-2" style={{ whiteSpace: 'nowrap' }}>Allow room members to run the code</span>
            <div className="form-check form-switch">
               <input type="checkbox" className="form-check-input" checked={canRunCode} onChange={() => handleSettingChange("canRunCode", !canRunCode, setCanRunCode)} />
            </div>
         </div>

         <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="me-2" style={{ whiteSpace: 'nowrap' }}>Allow room members to clear output</span>
            <div className="form-check form-switch">
               <input type="checkbox" className="form-check-input" checked={canClearOutput} onChange={() => handleSettingChange("canClearOutput", !canClearOutput, setCanClearOutput)} />
            </div>
         </div>

      </div>
   );
};

export default SettingsModal;