import { Button, Form, Stack } from 'react-bootstrap';
import { FaDoorOpen, FaPlusCircle } from 'react-icons/fa';
import { useSocket } from "../contextAPI/Socket";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from "sonner";

const HomePage = () => {
  const io = useSocket();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (io) {
      return () => {
        io.off("roomCreated");
        io.off("joinRoomResponse");
      };
    }
  }, [io]);

  const createNewRoom = () => {
    if (io) {
      io.emit("createRoom");
      io.once("roomCreated", (roomId) => {
        navigate("/codemode", { state: { roomId: roomId, isHost: true } });
      });
    }
  };

  const joinRoom = () => {
    if (!roomId.length) {
      toast("Enter your Room-ID");
    } else {
      io.emit("joinRoom", roomId);
      io.once("joinRoomResponse", (response) => {
        if (response === "Invalid room-id") {
          toast("Invalid Room-ID, Please enter correct Room-ID");
        } else {
          navigate("/codemode", { state: { roomId: roomId } });
        }
      });
    }
  };

  return (
    <div className="homepage-container">
      <div className="homepage-content container">
        <div className="content-box text-left">
          <h1 className="homepage-title">Welcome to DevAlliance</h1>
          <p className="homepage-subtitle">
            A platform where developers can collaborate in real time. Enter a room code to join a session or create a new room for coding with friends.
          </p>

          <Stack direction="horizontal" gap={2} className="align-items-center">
            <div className='d-flex gap-2'>
              <Form.Control type="text" placeholder="Enter Room Code" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="room-code-input" />
              <Button variant="primary" className="join-btn w-50 d-flex align-items-center justify-content-center" onClick={joinRoom}>
                <FaDoorOpen className="me-2" />
                Join
              </Button>
            </div>
            <Button variant="outline-warning" className="mt-3 d-flex align-items-center justify-content-center" onClick={createNewRoom}>
              <FaPlusCircle className="me-2" />
              Create Room
            </Button>
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default HomePage;