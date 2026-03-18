import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

export const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

export const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL },
});
