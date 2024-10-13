
import connectDB from './db/index.js';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=> {
    app.on("error", (error) => {
        console.log("ERROR: ", error);
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=> {
        console.log(`App is listening at port : ${process.env.PORT}`);
    })
})
.catch((error)=> {
    console.log("MONGODB connection failed :", error);
})







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