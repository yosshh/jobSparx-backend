import connectDB from './db/index.js';
import dotenv from 'dotenv';
import { app } from './app.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config({
    path: './.env'
});

// ✅ Create HTTP server for Express & WebSockets
const server = http.createServer(app);

// ✅ Setup WebSocket Server with Proper CORS & Authentication
const io = new Server(server, {
    cors: {
        origin: ["https://job-sparx-frontend.vercel.app", "http://localhost:5173"],
        credentials: true
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    if (!token) {
        console.log("❌ Unauthorized WebSocket Connection");
        return next(new Error("Unauthorized"));
    }
    console.log("✅ WebSocket Authenticated");
    next();
});

io.on("connection", (socket) => {
    console.log("📢 WebSocket Connected: " + socket.id);

    socket.on("subscribeToJobAlerts", (userId) => {
        console.log(`📢 User ${userId} subscribed to job alerts`);
        socket.join(`job-alerts-${userId}`);
    });

    socket.on("disconnect", () => {
        console.log("📢 WebSocket Disconnected: " + socket.id);
    });
});

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        // ✅ Start Server
        server.listen(process.env.PORT || 8000, () => {
            console.log(`✅ Server is running on port: ${process.env.PORT || 8000}`);
        });
    })
    .catch((error) => {
        console.log("❌ MongoDB Connection Failed: ", error);
    });

export { io };
