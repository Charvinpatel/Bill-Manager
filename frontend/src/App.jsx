import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar.jsx";
import "antd/dist/reset.css";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const CreateBill = lazy(() => import("./pages/CreateBill.jsx"));
const BillHistory = lazy(() => import("./pages/BillHistory.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const PinCode = lazy(() => import("./pages/PinCode.jsx"));

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    height: "100vh", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    background: "#F5F3FF"
  }}>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
        <Login onLogin={handleLogin} />
        <ToastContainer position="top-right" autoClose={3000} />
      </Suspense>
    );
  }

  if (!isPinVerified) {
    return (
      <Suspense fallback={<PageLoader />}>
        <PinCode onVerified={handlePinVerified} />
      </Suspense>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: "100vh", background: "#F5F3FF" }}>
        <Navbar onLogout={handleLogout} />
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateBill />} />
              <Route path="/history" element={<BillHistory />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
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
