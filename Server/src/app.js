import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "12kb" }))
app.use(urlencoded({ extended: true, limit: "12kb" })) //URLencoded for encoding the details in url like %20% used for spacing and many more it will encode automatically  extended for using nested objects
app.use(express.static("public"))  //for storing public assets like favicon,images etc.
app.use(cookieParser())//for accessing some cookier from user browser to server when required   

// router import

//make route using middleware



export { app }