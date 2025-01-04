import "./chat.scss";
import { to_Decrypt, to_Encrypt } from "../aes.js";
import React, { useState, useEffect, useRef } from "react";

function Chat({ username, roomname, socket, setEncryptedText, setDecryptedText }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log("Socket connected:", socket.connected);

    // Handle incoming messages
    const handleMessage = (data) => {
      console.log("Received message:", data);
      const decryptedText = to_Decrypt(data.text, data.username);

      // Only update messages if it's a new message to avoid unnecessary re-renders
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          userId: data.userId,
          username: data.username,
          text: decryptedText,
        },
      ]);

      // Set the decrypted text to the parent component (for Process)
      setDecryptedText(decryptedText);
    };

    // Attach the message handler to the socket
    socket.on("message", handleMessage);

    // Cleanup the socket listener on component unmount
    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket, setDecryptedText]); // Make sure useEffect runs properly with updated dependencies

  const sendData = () => {
    if (text.trim() !== "") {
      console.log("Send button clicked, text:", text.trim());
      const encryptedText = to_Encrypt(text.trim());
      console.log("Encrypted message:", encryptedText);

      // Emit the encrypted message to the backend
      socket.emit("chat", { text: encryptedText, username, roomname }, () => {
        console.log("Message emitted successfully");
      });

      // Set the encrypted text to the parent component (for Process)
      setEncryptedText(encryptedText);

      // Reset text input
      setText("");
    } else {
      console.log("Empty message, not sending.");
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [messages]); // Scroll when messages are updated

  return (
    <div className="chat">
      <div className="user-name">
        <h2>
          {username} <span style={{ fontSize: "0.7rem" }}>in {roomname}</span>
        </h2>
      </div>
      <div className="chat-message">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.username === username ? "" : "mess-right"}`}
          >
            <p>{msg.text}</p>
            <span>{msg.username}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="send">
        <input
          placeholder="Enter your message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendData();
            }
          }}
        />
        
        <button onClick={sendData}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
