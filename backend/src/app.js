import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import socketRoute from "./routes/socket.route.js";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8000;

const io = new Server(server, {
  cors: { origin: "*", allowedHeaders: "*" },
});

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

app.use("/", socketRoute(io));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 8000}`);
});
