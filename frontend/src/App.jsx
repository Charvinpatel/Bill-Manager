import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateBill from "./pages/CreateBill.jsx";
import BillHistory from "./pages/BillHistory.jsx";
import Login from "./pages/Login.jsx";
import PinCode from "./pages/PinCode.jsx";
import "antd/dist/reset.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  
  const [isPinVerified, setIsPinVerified] = useState(false);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsPinVerified(false);
    localStorage.removeItem("isLoggedIn");
  };

  const handlePinVerified = () => {
    setIsPinVerified(true);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    );
  }

  if (!isPinVerified) {
    return <PinCode onVerified={handlePinVerified} />;
  }

  return (
    <Router>
      <div style={{ minHeight: "100vh", background: "#F5F3FF" }}>
        <Navbar onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateBill />} />
            <Route path="/history" element={<BillHistory />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}
