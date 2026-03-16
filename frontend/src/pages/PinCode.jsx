import React, { useState, useEffect } from "react";
import { Card, Typography, Button, message, Space } from "antd";
import { LockFilled, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PinCode = ({ onVerified }) => {
  const [pin, setPin] = useState("");
  const targetPin = "1234"; // Default static PIN

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === targetPin) {
        message.success("PIN Verified");
        onVerified();
      } else {
        message.error("Incorrect PIN");
        setPin(""); // Reset after incorrect entry
      }
    }
  }, [pin, onVerified]);

  const KeyButton = ({ value, icon }) => (
    <Button
      onClick={() => (value !== null ? handleKeyPress(value) : handleDelete())}
      style={{
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        fontSize: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid #E2E8F0",
        background: "#FFF",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      {icon || value}
    </Button>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#F7FAFC",
        padding: "20px",
      }}
    >
      <div style={{ textAlign: "center", width: "100%", maxWidth: "320px" }}>
        <div
          style={{
            background: "#764ba2",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 20px",
            boxShadow: "0 4px 12px rgba(118, 75, 162, 0.3)",
          }}
        >
          <LockFilled style={{ color: "#FFF", fontSize: "24px" }} />
        </div>
        <Title level={3} style={{ marginBottom: "8px" }}>
          Enter PIN
        </Title>
        <Text type="secondary">Application is locked</Text>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            margin: "30px 0",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                background: pin.length > i ? "#764ba2" : "#E2E8F0",
                transition: "background 0.2s ease",
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            justifyItems: "center",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <KeyButton key={num} value={num} />
          ))}
          <div /> {/* Empty space */}
          <KeyButton value={0} />
          <KeyButton value={null} icon={<DeleteOutlined />} />
        </div>
      </div>
    </div>
  );
};

export default PinCode;
