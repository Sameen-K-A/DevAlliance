import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmileFill } from "react-icons/bs";

const EmojiPickerComponent = ({ onEmojiSelect }) => {
   const [showPicker, setShowPicker] = useState(false);

   const handleEmojiClick = (emoji) => {
      onEmojiSelect(emoji.emoji);
   };

   return (
      <div className="emoji-picker-wrapper position-relative">
         <button
            className="emoji-button btn d-flex align-items-center justify-content-center"
            onClick={() => setShowPicker(showPicker ? false : true)}
         >
            <BsEmojiSmileFill size={20} />
         </button>
         {showPicker && (
            <div className="emoji-picker-container position-absolute bottom-100 start-0 mb-2">
               <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
            </div>
         )}
      </div>
   );
};

export default EmojiPickerComponent;