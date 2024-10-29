import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom"

import CodeRoom from "./pages/CodeRoom";
import HomePage from "./pages/HomePage";

import 'bootstrap/dist/css/bootstrap.min.css';
import "../public/index.css";

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/codemode" element={<CodeRoom />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster expand={false} position="top-center" toastOptions={{ style: { backgroundColor: "#161616", color: "white", border: "none" } }} />
    </BrowserRouter>
  )

};

export default App;