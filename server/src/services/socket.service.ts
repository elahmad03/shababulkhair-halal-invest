import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { env } from "../config";
import RedisService from "./redis.service";

let io: SocketServer;

// -------------------------
// Initialize Socket.io
// -------------------------
export function initializeSocket(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: env.CLIENT_ORIGIN.split(",").map((o: string) => o.trim()),
      credentials: true,
    },
  });

  // -------------------------
  // Auth middleware on handshake
  // Every connection must send a valid access token
  // -------------------------
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = verifyAccessToken(token);

      // Check blacklist
      if (payload.jti && (await RedisService.isTokenJtiBlacklisted(payload.jti))) {
        return next(new Error("Token revoked"));
      }

      // Attach user to socket
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;

      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // -------------------------
  // On connection
  // -------------------------
  io.on("connection", (socket: Socket) => {
    const { userId, role } = socket.data;
    console.log(`⚡ Socket connected: ${userId} (${role})`);

    // -------------------------
    // Join booking room
    // Client emits this when they open a booking conversation
    // -------------------------
    socket.on("join:booking", (bookingId: string) => {
      if (!bookingId) return;
      socket.join(`booking:${bookingId}`);
      console.log(`📦 ${userId} joined booking:${bookingId}`);
    });

    // -------------------------
    // Leave booking room
    // Client emits this when they close/navigate away
    // -------------------------
    socket.on("leave:booking", (bookingId: string) => {
      if (!bookingId) return;
      socket.leave(`booking:${bookingId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${userId}`);
    });
  });

  return io;
}

// -------------------------
// Emit new message to booking room
// Called from booking service after message is saved to DB
// -------------------------
export function emitNewMessage(
  bookingId: string,
  message: {
    id: string;
    bookingId: string;
    senderRole: string;
    message: string;
    createdAt: Date;
  }
) {
  if (!io) return;
  io.to(`booking:${bookingId}`).emit("message:new", message);
}

// -------------------------
// Get io instance (for use elsewhere if needed)
// -------------------------
export function getIO(): SocketServer {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}