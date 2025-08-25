
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

let messages = [];

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/export", (req, res) => res.json({ messages }));
app.post("/import", (req, res) => {
  messages = req.body.messages || [];
  io.emit("messages:reset", messages);
  res.json({ ok: true });
});

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("user:join", (username) => {
    socket.emit("messages:init", messages);
  });

  socket.on("chat:message", (msg) => {
    const message = { id: Date.now(), user: msg.user, text: msg.text, ts: Date.now() };
    messages.push(message);
    io.emit("chat:message", message);
  });
});

server.listen(4000, () => console.log("Server running on http://localhost:4000"));
