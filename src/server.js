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

// ✅ Fix WebSocket CORS Issue (With Debugging)
const io = new Server(server, {
    cors: {
        origin: ["https://job-sparx-frontend-yg9o.vercel.app", "http://localhost:5173"], 
        methods: ["GET", "POST"], 
        allowedHeaders: ["Content-Type", "Authorization"], 
        credentials: true 
    }
});

io.on("connection", (socket) => {
    console.log("📢 WebSocket Connection Attempt from:", socket.handshake.headers.origin);

    if (!socket.handshake.headers.origin) {
        console.log("❌ Missing Origin Header - Possible CORS Issue");
    } else if (!["https://job-sparx-frontend-yg9o.vercel.app", "http://localhost:5173"].includes(socket.handshake.headers.origin)) {
        console.log(`❌ Unauthorized Origin: ${socket.handshake.headers.origin}`);
    } else {
        console.log("✅ WebSocket Connection Allowed");
    }

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

        // ✅ Use `server.listen` instead of `app.listen`
        server.listen(process.env.PORT || 8000, () => {
            console.log(`✅ Server is running on port: ${process.env.PORT || 8000}`);
        });
    })
    .catch((error) => {
        console.log("❌ MongoDB Connection Failed: ", error);
    });

export { io };
