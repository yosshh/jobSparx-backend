import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 


const app = express()


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// route import
import userRouter from './routes/user.routes.js'
import companyRouter from './routes/company.routes.js'
import jobRouter from './routes/jobs.routes.js'
import applicationRouter from './routes/application.routes.js'

// route declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/company", companyRouter)
app.use("/api/v1/jobs", jobRouter)
app.use("/api/v1/application", applicationRouter)

console.log("🔍 Checking Middleware Stack:");
app._router.stack.forEach((middleware) => {
    if (middleware.route) { 
        console.log(`✅ Registered Route: ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                console.log(`✅ Nested Route Registered: ${handler.route.path}`);
            }
        });
    }
});



export { app }