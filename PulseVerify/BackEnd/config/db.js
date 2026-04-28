import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
        return conn;
    } catch (err) {
        // Log the error but DO NOT crash the server.
        // The app will continue to run using seed data fallbacks.
        console.error("⚠️  MongoDB connection failed:", err.message);
        console.warn("⚠️  Server will continue with seed-data fallbacks.");
        return null;
    }
};

export default connectDB;