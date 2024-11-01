import { Select, MenuItem, FormControl } from '@mui/material';
import { languages } from '../../constants/languages';

const LanguageSelection = ({ selectedLanguage, setSelectedLanguage, canChangeLanguage }) => {

   const handleCodeChange = (e) => {
      if (!canChangeLanguage) {
         return;
      }
      setSelectedLanguage(e.target.value)
   }
   
   return (
      <FormControl variant="standard" style={{ width: '110px', position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}>
         <Select
            value={selectedLanguage}
            onChange={(event) => handleCodeChange(event)}
            renderValue={(selected) => selected}
            style={{ color: "#828282", backgroundColor: "transparent", textAlign: "right" }}
            MenuProps={{ PaperProps: { style: { backgroundColor: "#161616", color: "white" } } }}
         >
            {Object.entries(languages).map(([language, version]) => (
               <MenuItem key={language} value={language}>{language} - v{version}</MenuItem>
            ))}
         </Select>
      </FormControl>
   );
};

export default LanguageSelection;