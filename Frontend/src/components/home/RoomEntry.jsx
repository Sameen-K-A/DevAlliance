import { Button, Form, Stack } from 'react-bootstrap';
import { FaDoorOpen, FaPlusCircle } from 'react-icons/fa';
import { useSocket } from "../../contextAPI/Socket";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from "sonner";

const HomePage = () => {
  const io = useSocket();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [joinUsername, setJoinUserName] = useState("Abhiraj");
  const [createUserName, setCreateUserName] = useState("Sameen K A");
  const nameRegex = /^[A-Za-z\s]{3,15}$/;

  useEffect(() => {
    if (io) {
      return () => {
        io.off("roomCreated");
        io.off("joinRoomResponse");
      };
    }
  }, [io]);

  const createNewRoom = () => {
    if (!createUserName.trim().length) {
      toast("Please enter your name before creating a room.");
    } else if (!nameRegex.test(createUserName.trim())) {
      toast("Name must be 3-15 alphabetic characters.");
    } else {
      if (io) {
        io.emit("createRoom", { name: createUserName.trim() });
        io.once("roomCreated", (roomData) => {
          sessionStorage.setItem("roomData", JSON.stringify(roomData));
          sessionStorage.setItem("isHost", JSON.stringify(true));
          navigate("/codemode", { state: { name: createUserName.trim() } });
        });
      }
    }
  };

  const joinRoom = () => {
    if (!joinUsername.trim().length) {
      toast("Please enter your name to join the room.");
    } else if (!nameRegex.test(joinUsername.trim())) {
      toast("Name must be 3-15 alphabetic characters.");
    } else if (!roomId.trim().length) {
      toast("Please enter the Room-ID.");
    } else {
      io.emit("joinRoom", { roomId: roomId.trim(), joinUsername: joinUsername.trim() });
      io.once("joinRoomResponse", (roomData) => {
        if (roomData === "Invalid room-id") {
          toast("Invalid Room-ID, Please enter correct Room-ID.");
        } else if (roomData === "Room has reached the maximum number of members.") {
          toast("Room has reached the maximum number of members.");
        } else if (roomData === "This username already exists in the room. Please choose another name.") {
          toast("This username already exists in the room. Please choose another name.");
        } else {
          sessionStorage.setItem("roomData", JSON.stringify(roomData));
          navigate("/codemode", { state: { name: joinUsername.trim() } });
        }
      });
    }
  };

  return (
    <div className="homepage-container d-flex justify-content-center align-items-center">
      <div className="homepage-content container text-left">
        <h1 className="homepage-title text-light mb-4">Welcome to <span className='text-primary'>DevAlliance</span></h1>
        <p className="homepage-subtitle mb-5">
          A platform where developers can collaborate in real time, share ideas, and build projects together. Whether you're leading a team or joining one, DevAlliance offers you the tools to work efficiently.
        </p>

        <div className="divider d-flex flex-column flex-sm-row align-items-start justify-content-between mt-5 mx-auto">
          <div className="left-side col-12 col-sm-5 mb-3 mb-sm-0">
            <p className="side-description mb-3 text-muted">
              Create a new room and invite others to join. Perfect for starting a fresh session with your team.
            </p>
            <Stack direction="vertical" gap={3} className="align-items-center">
              <Form.Control type="text" placeholder="Enter your name" value={createUserName} onChange={(e) => setCreateUserName(e.target.value)} className="name-input mb-2 w-100" />
              <Button variant="outline-warning" className="create-btn w-100 d-flex justify-content-center align-items-center" onClick={createNewRoom}>
                <FaPlusCircle className="me-2" />
                Create Room
              </Button>
            </Stack>
          </div>

          <div className="divider-line d-none d-sm-block mx-4" />

          <div className="right-side col-12 col-sm-5 mb-3 mb-sm-0">
            <p className="side-description mb-3 text-muted">
              Already have a room code? Enter your name and the room code below to join the session.
            </p>
            <Stack direction="vertical" gap={3} className="align-items-center">
              <Form.Control type="text" placeholder="Enter your name" value={joinUsername} onChange={(e) => setJoinUserName(e.target.value)} className="name-input mb-1 w-100" />
              <Form.Control type="text" placeholder="Enter Room Code" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="room-code-input mb-2 w-100" />
              <Button variant="outline-primary" className="join-btn w-100 d-flex justify-content-center align-items-center" onClick={joinRoom}>
                <FaDoorOpen className="me-2" />
                Join
              </Button>
            </Stack>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;