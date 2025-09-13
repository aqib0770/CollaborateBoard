import express from "express";
const router = express.Router();
import socketController from "../controllers/socket.controller.js";

export default (io) => {
  socketController(io);
  return router;
};
