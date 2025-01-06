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

      if (data.file) {
        // Decrypt the file content
        const decryptedFile = to_Decrypt(data.file, data.username);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            userId: data.userId,
            username: data.username,
            file: decryptedFile,
            fileName: data.fileName,
          },
        ]);

        setDecryptedText(decryptedFile); // Update decrypted text for Process component
      } else {
        // Handle text messages
        const decryptedText = to_Decrypt(data.text, data.username);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            userId: data.userId,
            username: data.username,
            text: decryptedText,
          },
        ]);

        setDecryptedText(decryptedText); // Update decrypted text for Process component
      }
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket, setDecryptedText]);

  const sendData = () => {
    if (text.trim() !== "") {
      const encryptedText = to_Encrypt(text.trim());
      socket.emit("chat", { text: encryptedText, username, roomname }, () => {
        console.log("Message emitted successfully");
      });

      setEncryptedText(encryptedText); // Update encrypted text for Process component
      setText(""); // Clear input field
    }
  };

  const sendFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64File = reader.result;

      // Encrypt the file content
      const encryptedFile = to_Encrypt(base64File);

      // Emit the encrypted file to the server
      socket.emit(
        "file",
        {
          file: encryptedFile, // Send encrypted file content
          fileName: file.name,
          username,
          roomname,
        },
        () => {
          console.log("File emitted successfully");
        }
      );

      // Only update the messages state after the server broadcasts the file
      setEncryptedText(encryptedFile); // Update encrypted text for Process component
    };

    reader.readAsDataURL(file);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [messages]);

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
            {msg.text && <p>{msg.text}</p>}
            {msg.file && (
              <p>
                <a href={msg.file} download={msg.fileName}>
                  {msg.fileName}
                </a>
              </p>
            )}
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
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files[0]) {
              sendFile(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}

export default Chat;
