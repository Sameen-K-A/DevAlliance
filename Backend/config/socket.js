import { Server as SocketServer } from "socket.io";

let io;
const activeRooms = {};

const configSocketIO = (httpServer) => {
   io = new SocketServer(httpServer, {
      cors: {
         origin: ["http://localhost:5173"],
         methods: ["GET", "POST"],
      },
   });

   io.on("connection", (socket) => {
      console.log("User connected with socket", socket.id);

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
            io.to(roomId).emit("userJoined", socket.id);
            console.log("Current room status,", activeRooms[roomId]);
         }
      });

      socket.on("LeaveRoom", (roomId) => {
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