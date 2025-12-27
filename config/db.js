import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.DB_URI)
        mongoose.connection.on('connected', () => {
            console.log('Database connected!')
        })
        console.log('DB connected successfully!')
    } catch (error) {
        console.log('Error in DB connection', error)
        console.log(error.message)
    }
}


export default connectDB