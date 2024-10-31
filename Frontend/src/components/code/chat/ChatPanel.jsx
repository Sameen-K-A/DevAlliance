import { useEffect, useState } from "react";
import { IoMdClose, IoMdSend } from "react-icons/io";
import { FaAngleUp } from "react-icons/fa";
import { useSocket } from "../../../contextAPI/Socket";
import ImojiPicker from "./ImojiPicker";

const ChatPanel = ({ roomId }) => {
   const [messages, setMessages] = useState([]);
   const [isHistoryVisible, setIsHistoryVisible] = useState(false);
   const [enterMessage, setEnterMessage] = useState("");
   const io = useSocket();

   useEffect(() => {
      if (io) {
         io.on("receiveMessage", (messageData) => {
            setMessages((prevMessages) => [...prevMessages, messageData]);
         });
      }
      return () => {
         if (io) {
            io.off("receiveMessage");
         }
      };
   }, []);

   const handleSendMessage = () => {
      if (enterMessage.trim() && roomId) {
         io.emit("sendMessage", { enterMessage, roomId });
         setEnterMessage("");
      }
   };

   const handleEmojiSelect = (emoji) => {
      setEnterMessage((prevMessage) => prevMessage + emoji);
   };

   return (
      <div className="chat-panel position-fixed end-0 bottom-0 m-3 text-light rounded">
         <div className="chat-heading d-flex justify-content-between align-items-center p-2">
            <span className="fw-bold ms-2">Chat</span>
            <button className="text-light p-0 btn" onClick={() => setIsHistoryVisible(!isHistoryVisible)}>
               {isHistoryVisible ? <IoMdClose size={20} /> : <FaAngleUp size={20} />}
            </button>
         </div>

         {isHistoryVisible && (
            <div className="chat-history p-2 border-top border-secondary mb-2" style={{ maxHeight: "400px", overflowY: "auto" }}>
               {messages.length ? (
                  messages.map((data, index) => (
                     <div key={index} className="p-2 message-box my-1">
                        <div className="d-flex justify-content-between" style={{ fontSize: "12px", color: "#888" }}>
                           <span className="message-name">{data.name}</span>
                           <span className="message-time">{data.time}</span>
                        </div>
                        <div className="message-content" style={{ fontSize: "16px", color: "#fff", whiteSpace: "pre-wrap" }}>
                           {data.message}
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="d-flex justify-content-center align-items-center">No messages found</div>
               )}
            </div>
         )}

         <div className="input-container d-flex align-items-center position-relative">
            <ImojiPicker onEmojiSelect={handleEmojiSelect} />
            <textarea
               className="form-control message-input"
               placeholder="Type your message..."
               value={enterMessage}
               onChange={(e) => setEnterMessage(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSendMessage();
                  }
               }}
               style={{ resize: "none" }}
            />
            <button
               className="send-button btn d-flex align-items-center justify-content-center"
               onClick={handleSendMessage}>
               <IoMdSend size={20} />
            </button>
         </div>
      </div>
   );
};

export default ChatPanel;
