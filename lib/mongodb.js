import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("Falta configurar la variable de entorno MONGODB_URI");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
        await mongoose.connection.asPromise();
        return mongoose.connection;
    }

    await mongoose.connect(uri);
    return mongoose.connection;
}
