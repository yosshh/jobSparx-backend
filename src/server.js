import connectDB from './db/index.js';
import dotenv from 'dotenv';
import { app } from './app.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config({
    path: './.env'
});

// ✅ Create HTTP server for both Express & WebSockets
const server = http.createServer(app);

// ✅ Setup WebSocket Server with Proper CORS
const io = new Server(server, {
    cors: {
        origin: ["https://job-sparx-frontend.vercel.app", "http://localhost:5173"], 
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("📢 WebSocket Connected: " + socket.id);

    socket.on("subscribeToJobAlerts", (userId) => {
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
