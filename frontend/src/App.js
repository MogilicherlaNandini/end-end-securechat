import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { Buffer } from "buffer";
import Chat from "./chat/chat";
import Process from "./process/process";
import Home from "./home/home";
import io from "socket.io-client";
import "./App.scss";

const socket = io.connect("http://localhost:8000");
window.Buffer = Buffer;

function Appmain() {
  const { username, roomname } = useParams();
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [encryptedFile, setEncryptedFile] = useState("");

  return (
    <React.Fragment>
      <div className="right">
        <Chat
          username={username}
          roomname={roomname}
          socket={socket}
          setEncryptedText={setEncryptedText}
          setDecryptedText={setDecryptedText}
          setEncryptedFile={setEncryptedFile} // Pass file handler
        />
      </div>
      <div className="left">
        <Process
          encryptedText={encryptedText}
          decryptedText={decryptedText}
          encryptedFile={encryptedFile} // Display encrypted file data
        />
      </div>
    </React.Fragment>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home socket={socket} />} />
          <Route path="/chat/:roomname/:username" element={<Appmain />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
