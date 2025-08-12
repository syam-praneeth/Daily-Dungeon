const { Server } = require("socket.io");
const { setIo } = require("./socketIOInstance");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("./config/config");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const User = require("./models/User");

// In-memory presence map { userId: Set(socketId) }
const online = new Map();

function authSocket(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!token) return next(new Error("auth_required"));
    const decoded = jwt.verify(token, jwtSecret);
    socket.user = decoded.user; // { id }
    next();
  } catch (e) {
    next(new Error("auth_invalid"));
  }
}

function setupPresence(io, socket) {
  const userId = socket.user.id;
  if (!online.has(userId)) online.set(userId, new Set());
  online.get(userId).add(socket.id);
  socket.join(`user:${userId}`);
  // Join all conversation rooms for this user
  Conversation.find({ members: userId })
    .select({ _id: 1, members: 1 })
    .lean()
    .then((convs) => {
      const contacts = new Set();
      convs.forEach((c) => {
        socket.join(`conv:${c._id}`);
        (c.members || []).forEach((m) => {
          const mid = String(m);
          if (mid !== String(userId)) contacts.add(mid);
        });
      });
      // Notify contacts that this user is online
      for (const cid of contacts) {
        io.to(`user:${cid}`).emit("presence:update", {
          userId,
          status: "online",
        });
      }
    });

  // Also update own devices
  io.to(`user:${userId}`).emit("presence:update", { userId, status: "online" });

  socket.on("disconnect", async () => {
    const sockets = online.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        online.delete(userId);
        const lastSeen = Date.now();
        try {
          await User.updateOne(
            { _id: userId },
            { $set: { lastSeen: new Date(lastSeen) } }
          );
        } catch (e) {
          // ignore persistence error
        }
        // Notify own devices
        io.to(`user:${userId}`).emit("presence:update", {
          userId,
          status: "offline",
          lastSeen,
        });
        // Notify contacts (members from conversations)
        try {
          const convs = await Conversation.find({ members: userId })
            .select({ members: 1 })
            .lean();
          const contacts = new Set();
          convs.forEach((c) =>
            (c.members || []).forEach((m) => {
              const mid = String(m);
              if (mid !== String(userId)) contacts.add(mid);
            })
          );
          for (const cid of contacts) {
            io.to(`user:${cid}`).emit("presence:update", {
              userId,
              status: "offline",
              lastSeen,
            });
          }
        } catch {}
      }
    }
  });
}

function socketServer(httpServer, corsOrigin = "*") {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
  });
  setIo(io);
  io.use(authSocket);

  io.on("connection", (socket) => {
    setupPresence(io, socket);

    socket.on("typing:start", ({ conversationId }) => {
      if (!conversationId) return;
      io.to(`conv:${conversationId}`).emit("typing", {
        conversationId,
        userId: socket.user.id,
        isTyping: true,
      });
    });
    socket.on("typing:stop", ({ conversationId }) => {
      if (!conversationId) return;
      io.to(`conv:${conversationId}`).emit("typing", {
        conversationId,
        userId: socket.user.id,
        isTyping: false,
      });
    });

    socket.on("message:send", async (payload) => {
      try {
        const {
          conversationId,
          tempId,
          type = "text",
          text,
          mediaUrl,
          replyToMessageId,
        } = payload || {};
        if (!conversationId) return;
        const conv = await Conversation.findById(conversationId).lean();
        if (!conv || !conv.members.map(String).includes(socket.user.id)) return;
        if (type === "text" && (!text || String(text).trim().length === 0))
          return;
        const msg = await Message.create({
          conversationId,
          senderId: socket.user.id,
          type,
          text,
          mediaUrl,
          replyToMessageId,
        });
        await Conversation.updateOne(
          { _id: conversationId },
          { $set: { lastMessageId: msg._id, updatedAt: new Date() } }
        );
        // Ensure all online members are joined to this conversation room (covers new convs)
        try {
          for (const uid of conv.members.map(String)) {
            const set = online.get(uid);
            if (!set) continue;
            for (const sid of set) {
              const s = io.sockets.sockets.get(sid);
              if (s) s.join(`conv:${conversationId}`);
            }
          }
        } catch {}
        // Ack to sender
        socket.emit("message:ack", {
          tempId,
          serverId: String(msg._id),
          createdAt: msg.createdAt,
        });
        // Broadcast to other members in the conversation room (no echo to sender)
        socket
          .to(`conv:${conversationId}`)
          .emit("message:new", { message: msg });
      } catch (e) {}
    });

    socket.on(
      "message:delivered",
      async ({ conversationId, messageIds = [] }) => {
        try {
          const userId = socket.user.id;
          await Message.updateMany(
            { _id: { $in: messageIds }, conversationId },
            {
              $addToSet: { deliveredTo: userId },
              $set: { status: "delivered" },
            }
          );
          messageIds.forEach((id) =>
            io
              .to(`conv:${conversationId}`)
              .emit("message:delivered", { messageId: id, userId })
          );
        } catch {}
      }
    );

    socket.on("message:read", async ({ conversationId, messageIds = [] }) => {
      try {
        const userId = socket.user.id;
        const readAt = new Date();
        await Message.updateMany(
          { _id: { $in: messageIds }, conversationId },
          {
            $addToSet: { readBy: { userId, readAt } },
            $set: { status: "read" },
          }
        );
        messageIds.forEach((id) =>
          io
            .to(`conv:${conversationId}`)
            .emit("message:read", { messageId: id, userId, readAt })
        );
      } catch {}
    });

    socket.on("presence:ping", () => {
      // could update a heartbeat if needed
    });
  });

  return io;
}

module.exports = { socketServer };
