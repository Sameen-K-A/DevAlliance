import { Server as SocketServer } from "socket.io";

let io;
const activeRooms = {};

const configSocketIO = (httpServer) => {
   io = new SocketServer(httpServer, {
      cors: {
         origin: [process.env.FRONTEND_LOCALHOST_URL],
         methods: ["GET", "POST"],
      },
   });

   io.on("connection", (socket) => {
      console.log("User connected with socket", socket.id);

      //! ======================= Coding room management Create, Join, Exit ======================================================

      socket.on("createRoom", () => {
         let roomId = Math.random().toString(36).substring(2, 12);
         while (activeRooms[roomId]) {
            roomId = Math.random().toString(36).substring(2, 12);
         };
         activeRooms[roomId] = {
            host: socket.id,
            members: {}
         };
         activeRooms[roomId].members[socket.id] = true;
         socket.join(roomId);
         socket.emit("roomCreated", roomId);
         console.log("Current room status,", activeRooms[roomId]);
      });

      socket.on("joinRoom", (roomId) => {
         if (!activeRooms[roomId]) {
            socket.emit("joinRoomResponse", "Invalid room-id");
         } else {
            activeRooms[roomId].members[socket.id] = true;
            socket.join(roomId);
            socket.emit("joinRoomResponse", "Success");

            const roomData = {
               currentCode: activeRooms[roomId].currentCode || defaultCode[activeRooms[roomId].language || "javascript"],
               output: activeRooms[roomId].output || "",
               error: activeRooms[roomId].error || "",
               language: activeRooms[roomId].language || "javascript"
            };
            socket.emit("roomData", roomData);

            io.to(roomId).emit("userJoined", socket.id);
            console.log("Current room status,", activeRooms[roomId]);
         }
      });

      socket.on("LeaveRoom", (roomId) => {
         if (!activeRooms[roomId]) {
            console.log(`Room ${roomId} does not exist.`);
            return;
         };
         if (activeRooms[roomId].host === socket.id) {
            io.to(roomId).emit("RoomClosed", roomId);
            delete activeRooms[roomId];
            io.in(roomId).socketsLeave(roomId);
            console.log(`Room ${roomId} closed by host ${socket.id}`);
         } else {
            delete activeRooms[roomId].members[socket.id];
            socket.leave(roomId);
            io.to(roomId).emit("userLeft", socket.id);
            console.log(`User ${socket.id} left room ${roomId}`);
         }
      });

      //! =============================== Coding room managment is ended ================================================================
      //! ======================= Coding screen updations like code, language, output, error ============================================

      socket.on("CodeUpdation", ({ enteredCode, roomId }) => {
         if (!activeRooms[roomId]) {
            return;
         };
         activeRooms[roomId].currentCode = enteredCode;
         io.to(roomId).emit("UpdatedCode", enteredCode);
      });

      socket.on("OutputUpdation", ({ output, roomId }) => {
         if (!activeRooms[roomId]) {
            return;
         };
         activeRooms[roomId].output = output;
         io.to(roomId).emit("UpdatedOutput", output);
      });

      socket.on("ErrorUpdation", ({ error, roomId }) => {
         if (!activeRooms[roomId]) {
            return;
         };
         activeRooms[roomId].error = error;
         io.to(roomId).emit("UpdatedError", error);
      });

      socket.on("LanguageUpdation", ({ language, roomId }) => {
         if (!activeRooms[roomId]) {
            return;
         };
         activeRooms[roomId].language = language;
         io.to(roomId).emit("UpdatedLanguage", language);
      });

      //! ================================== Coding screen updations end ==================================================================
      //! ================================== Chat management reciever and sender ==========================================================

      socket.on("sendMessage", ({ enterMessage, roomId }) => {
         const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         const messageData = {
            name: socket.id,
            message: enterMessage,
            time: currentTime
         };
         console.log("Sending message to room:", roomId, messageData);
         io.to(roomId).emit("receiveMessage", messageData);
      });

      //! ================================== Chat management end =========================================================================

      socket.on("disconnect", () => {
         console.log(`User disconnected: ${socket.id}`);
         for (const roomId in activeRooms) {
            const room = activeRooms[roomId];
            if (room.members[socket.id]) {
               delete room.members[socket.id];
               io.to(roomId).emit("userLeft", socket.id);
               console.log(`User ${socket.id} removed from room ${roomId} due to disconnection`);

               if (room.host === socket.id) {
                  io.to(roomId).emit("RoomClosed", roomId);
                  delete activeRooms[roomId];
                  io.in(roomId).socketsLeave(roomId);
               }
            }
         }
      });
   });
};

export { configSocketIO, io };