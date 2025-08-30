import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Admin from "@/pages/admin/Admin";
import User from "@/pages/user/User";
import Leave from "./pages/user/main/Leave";
import Planning from "./pages/user/main/planning/planning";
import Agent from "./pages/admin/main/Agent";
import PlanningAdmin from "./pages/admin/main/PlanningAdmin";
import LeaveAdmin from "./pages/admin/main/LeaveAdmin";
import Week from "./pages/user/main/planning/Week";
import Month from "./pages/user/main/planning/Month";
import { AuthProvider } from "./authConf/AuthContext";
import { PrivaRoute } from "./authConf/PrivateRoute";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<PrivaRoute roles={["ADMIN"]} />}>
              <Route path="/admin" element={<Admin />}>
                <Route index element={<Agent />} />
                <Route path="planning" element={<PlanningAdmin />} />
                <Route path="leave" element={<LeaveAdmin />} />
              </Route>
            </Route>
            <Route element={<PrivaRoute roles={["EMPLOYEE"]}/>}>
              <Route path="/user" element={<User />}>
                <Route index element={<Leave />} />
                <Route path="planning" element={<Planning />}>
                  <Route index element={<Week />} />
                  <Route path="month" element={<Month />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
