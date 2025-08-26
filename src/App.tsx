import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Admin from "@/pages/admin/Admin";
import User from "@/pages/user/User";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/admin" element={<Admin/>} />
          <Route path="/user" element={<User/>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
