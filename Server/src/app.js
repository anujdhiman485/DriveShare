import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost on any port for development
        if (origin.match(/^http:\/\/localhost:\d+$/)) {
            return callback(null, true);
        }
        
        // Allow specific origin from env
        if (process.env.CORS_ORIGIN === '*' || origin === process.env.CORS_ORIGIN) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: "12kb" }))
app.use(urlencoded({ extended: true, limit: "12kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Router imports
import authRouter from './routes/auth.routes.js'
import carRouter from './routes/car.routes.js'
import bookingRouter from './routes/booking.routes.js'
import exchangeRouter from './routes/exchange.routes.js'
import reviewRouter from './routes/review.routes.js'

// Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/cars', carRouter)
app.use('/api/v1/bookings', bookingRouter)
app.use('/api/v1/exchanges', exchangeRouter)
app.use('/api/v1/reviews', reviewRouter)

// Health check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'DriveShare API is running!' 
    })
})

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
})

export { app }