import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom"

import CodeRoom from "./pages/CodeRoom";
import HomePage from "./pages/HomePage";
import RoomProtecter from "./components/services/RoomProtector";

import 'bootstrap/dist/css/bootstrap.min.css';
import "../public/index.css";

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/codemode" element={<RoomProtecter><CodeRoom /></RoomProtecter>} />
      </Routes>
      <Toaster expand={false} position="top-center" duration={1500} toastOptions={{ style: { backgroundColor: "#161616", color: "white", border: "none" } }} />
    </BrowserRouter>
  )

};

export default App;