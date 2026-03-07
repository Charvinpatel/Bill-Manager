import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateBill from "./pages/CreateBill.jsx";
import BillHistory from "./pages/BillHistory.jsx";
import "antd/dist/reset.css";

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", background: "#F5F3FF" }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateBill />} />
            <Route path="/history" element={<BillHistory />} />
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
