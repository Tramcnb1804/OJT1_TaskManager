import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import Task from "./pages/TaskManager.jsx"
import UserManagement from './pages/UserManager.jsx'; // ví dụ

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/task" element={<Task />} />
<       Route path="/users" element={<UserManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
