import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RoomProtecter = ({ children }) => {
   const navigate = useNavigate();
   let roomData = sessionStorage.getItem("roomData");
   let isHost = sessionStorage.getItem("isHost");
   if (roomData) {
      roomData = JSON.parse(roomData);
   }
   if (isHost) {
      isHost = JSON.parse(isHost);
   } else {
      isHost = false;
   }
   sessionStorage.removeItem("roomData");
   sessionStorage.removeItem("isHost");

   useEffect(() => {
      if (!roomData) {
         navigate("/", { state: { message: "Authorization failed, Please rejoin" }, replace: true });
      }
   }, []);

   if (roomData && roomData.roomId) {
      return (
         <>
            {React.cloneElement(children, { roomData, isHost })}
         </>
      )
   }
};

export default RoomProtecter;