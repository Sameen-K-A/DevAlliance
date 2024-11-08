import { Server as SocketServer } from "socket.io";

let io;
const activeRooms = {};

const getRoomData = (roomId, socketID) => {
   return {
      socketID: socketID,
      roomId: roomId,
      currentCode: activeRooms[roomId]?.currentCode || "",
      output: activeRooms[roomId]?.output || "Click Run button for execute your code.",
      error: activeRooms[roomId]?.error || "",
      language: activeRooms[roomId]?.language || "javascript",
      members: activeRooms[roomId]?.members || {},
      canEditCode: activeRooms[roomId]?.canEditCode || false,
      canChangeLanguage: activeRooms[roomId]?.canChangeLanguage || false,
      canRunCode: activeRooms[roomId]?.canRunCode || false,
      canClearOutput: activeRooms[roomId]?.canClearOutput || false,
   };
};

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

      socket.on("createRoom", ({ name }) => {
         let roomId = Math.random().toString(36).substring(2, 12);
         while (activeRooms[roomId]) {
            roomId = Math.random().toString(36).substring(2, 12);
         };
         activeRooms[roomId] = {
            roomId: roomId,
            host: socket.id,
            members: {},
            currentCode: `function greeting() {\n\tconsole.log('Hey! Start your coding journey and boost your skills. Collaborate with your colleagues for an even better experience!');\n}\n\ngreeting();`,
            language: "javascript",
            output: "Click Run button for execute your code.",
            error: "",
            canEditCode: false,
            canChangeLanguage: false,
            canRunCode: false,
            canClearOutput: false,
         };

         activeRooms[roomId].members[socket.id] = name;
         socket.join(roomId);
         const roomData = getRoomData(roomId, socket.id);
         socket.emit("roomCreated", roomData);
         console.log("Current room status,", activeRooms[roomId]);
      });

      socket.on("joinRoom", ({ roomId, joinUsername }) => {
         if (!activeRooms[roomId]) {
            socket.emit("joinRoomResponse", "Invalid room-id");
            return;
         }

         if (Object.keys(activeRooms[roomId].members).length >= 4) {
            socket.emit("joinRoomResponse", "Room has reached the maximum number of members.");
            return;
         };

         if (Object.values(activeRooms[roomId].members).includes(joinUsername)) {
            socket.emit("joinRoomResponse", "This username already exists in the room. Please choose another name.");
            return;
         }

         activeRooms[roomId].members[socket.id] = joinUsername;
         socket.join(roomId);
         const roomData = getRoomData(roomId, socket.id);
         socket.emit("joinRoomResponse", roomData);
         socket.broadcast.to(roomId).emit("userJoined", joinUsername);
         console.log("Current room status,", activeRooms[roomId]);

      });

      socket.on("LeaveRoom", (roomId) => {
         if (!activeRooms[roomId]) {
            console.log(`Room ${roomId} does not exist.`);
            return;
         };

         const username = activeRooms[roomId].members[socket.id];
         if (!username) {
            console.log(`User has already left room ${roomId}`);
            return;
         }

         if (activeRooms[roomId].host === socket.id) {
            io.to(roomId).emit("RoomClosed", roomId);
            delete activeRooms[roomId];
            io.in(roomId).socketsLeave(roomId);
            console.log(`Room ${roomId} closed by host ${socket.id}`);
         } else {
            delete activeRooms[roomId].members[socket.id];
            socket.leave(roomId);
            socket.broadcast.to(roomId).emit("userLeft", username);
            console.log(`User ${username} left room ${roomId}`);
         }
      });

      //! =============================== Coding room managment is ended ================================================================
      //! ======================= Coding screen updations like code, language, output, error ============================================

      socket.on("CodeUpdation", ({ enteredCode, roomId }) => {
         if (!activeRooms[roomId]) {
            return;
         };
         activeRooms[roomId].currentCode = enteredCode;
         socket.broadcast.to(roomId).emit("UpdatedCode", enteredCode);
      });

      socket.on("OutputUpdation", ({ output, roomId }) => {
         if (!activeRooms[roomId]) {
            return;
         };
         activeRooms[roomId].output = output;
         socket.broadcast.to(roomId).emit("UpdatedOutput", output);
      });

      socket.on("ErrorUpdation", ({ error, roomId }) => {
         if (!activeRooms[roomId]) {
            return;
         };
         activeRooms[roomId].error = error;
         socket.broadcast.to(roomId).emit("UpdatedError", error);
      });

      socket.on("LanguageUpdation", ({ language, roomId }) => {
         if (!activeRooms[roomId]) {
            return;
         };
         activeRooms[roomId].language = language;
         socket.broadcast.to(roomId).emit("UpdatedLanguage", language);
      });

      //! ================================== Coding screen updations end ==================================================================
      //! ================================== Host room control updation ===================================================================

      socket.on("updateSettings", ({ roomId, settingName, value }) => {
         if (!activeRooms[roomId]) {
            return;
         }
         activeRooms[roomId][settingName] = value;
         socket.broadcast.to(roomId).emit("settingsUpdated", { settingName, value });
         console.log(`Room ${roomId}: ${settingName} set to ${value}`);
      });

      //! ================================== Host room control updation end ================================================================
      //! ================================== Chat message sended to room ===================================================================

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

      //! ================================== Chat message control end ===================================================================

      socket.on("disconnect", () => {
         console.log(`User disconnected: ${socket.id}`);
         for (const roomId in activeRooms) {
            const room = activeRooms[roomId];
            if (room.members[socket.id]) {
               const username = room.members[socket.id];
               delete room.members[socket.id];
               io.to(roomId).emit("userLeft", username);
               console.log(`User ${username} removed from room ${roomId} due to disconnection`);

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