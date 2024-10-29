import { useContext, createContext, useEffect, useState } from "react";
import { io as socket } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
   const [io, setIo] = useState(null);

   useEffect(() => {
      const newSocket = socket(import.meta.env.VITE_BASE_URL);
      setIo(newSocket);

      return () => newSocket.close();
   }, []);

   return (
      <SocketContext.Provider value={io}>
         {children}
      </SocketContext.Provider>
   );
};