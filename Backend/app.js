import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { configSocketIO } from "./config/socket.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
configSocketIO(server);

app.use(cors({
   origin: [process.env.FRONTEND_LOCALHOST_URL],
   credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

server.listen(process.env.PORT, () => {
   console.log(`Server started at port number ${process.env.PORT}`);
});