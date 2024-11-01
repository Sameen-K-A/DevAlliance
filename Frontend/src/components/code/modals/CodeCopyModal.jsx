import { IoCopy } from "react-icons/io5";

const CodeCopyModal = ({ roomId, handleCopy }) => {
   return (
      <div className="code-share">
         <p className="text-light m-0">{roomId}</p>
         <IoCopy fill="#c4c4c4" onClick={handleCopy} style={{ cursor: 'pointer' }} />
      </div>
   )
}

export default CodeCopyModal