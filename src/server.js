
import connectDB from './db/index.js';
import dotenv from 'dotenv';
import { app } from './app.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config({
    path: './.env'
})

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [process.env.CORS_ORIGIN, 'http://localhost:5173'],
        credentials: true
    }
});


io.on("connection", (socket)=> {
    console.log("A user connected: "+ socket.id);

    socket.on("subscribeToJobAlerts", (userId)=> {
        socket.join(`job-alerts-${userId}`)
    })

    socket.on("disconnect", ()=> {
        console.log("User disconnected: "+socket.id);
    })
})

connectDB()
.then(()=> {
    app.on("error", (error) => {
        console.log("ERROR: ", error);
        throw error
    })

    console.log("🔍 Checking Registered Routes:");
    app._router.stack.forEach((middleware) => {
        if (middleware.route) { 
            console.log(`✅ Route registered: ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    console.log(`✅ Nested Route registered: ${handler.route.path}`);
                }
            });
        }
    });
    server.listen(process.env.PORT || 8000, ()=> {
        console.log(`App is listening at port : ${process.env.PORT}`);
    })
})
.catch((error)=> {
    console.log("MONGODB connection failed :", error);
})


export {io};






/*
import express from 'express'

const app = express()

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error
        })

        app.listen(process.env.PORT, ()=> {
            console.log(`app listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR : ", error)
        throw error
    }
})()
*/