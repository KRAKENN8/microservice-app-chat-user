"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

let socket;

export default function Chat() {
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);

  const handleNavigation = () => {
    router.push('/docs');
  };

  const handleHome = () => {
    router.push('/');
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      window.location.href = "/";
      return;
    }

    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);

    socket = io("http://localhost:8000");

    socket.on("connect", () => {
      socket.emit("set_username", parsedUser.name);
    });

    socket.on("history", (history) => {
      setMessages(history);
    });

    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("online_users", (users) => {
      setOnline(users);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (!input) return;
    socket.emit("chat_message", input);
    setInput("");
  };

  if (!user) return null;

  return (
    <div className="h-screen flex">
      <div className="flex flex-col flex-1">
          {messages.map((message, i) => (
            <div key={i} className="border p-2">
              <div className="">{message.user}</div>
              <div>{message.text}</div>
            </div>
          ))}

        <div className="flex border p-2">
          <input className="flex-9 p-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message"/>
          <button className="flex-1 border-l p-2" onClick={sendMessage}>Send</button>
        </div>
      </div>

      <div className="w-60 p-2">
        <div>Online ({online.length})</div>
        <ul className="p-2">
          {online.map((user, i) => (
            <h1 key={i}>{user}</h1>
          ))}
        </ul>
      </div>

      <div className="p-4">
        <button className="flex-1 border p-2" onClick={handleNavigation}>Docs</button>
        <button className="flex-1 border p-2" onClick={handleHome}>Home</button>
      </div>
    </div>
  );
}