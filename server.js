import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import { configDotenv } from 'dotenv'
import connectDB from './config/db.js'
import userRoutes from './routes/User.js'
import sellerRoutes from './routes/Seller.js'
import productRoutes from './routes/product.js'
import connectCloudinary from './config/cloudinary.js'
import cartRouter from './routes/cartRoutes.js'
import addressRouter from './routes/addressRoute.js'
import orderRouter from './routes/orderRoute.js'
import { stripeWebhooks } from './controller/orderController.js'
configDotenv()
const app = express()
const PORT = process.env.PORT || 3000

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173']

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// middleware

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin: allowedOrigins, credentials: true}))

// routes
app.use('/api/user', userRoutes)
app.use('/api/seller', sellerRoutes)
app.use('/api/product', productRoutes)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/orders', orderRouter)        // I made MISTAKE here, it was so dumb to write it incorrect, ORDERS instead ORDERS

app.get('/', (req, res) => {
    res.send('App is working')
})



connectDB().then(
    app.listen(PORT, () => {
        console.log(`Server is running on Port: ${PORT}`)
    })
).catch((e) => console.log('Not connected!', e.message))

connectCloudinary().then(
    console.log('Cloudinary connected Successfully!')
).catch((e) => {
    console.log(`Error in cloudinary connection: ${e.message}`)
})