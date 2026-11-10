import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Metodo no permitido" });
    }

    try {
        const mongoUri = process.env.MONGODB_URI?.trim();
        if (!mongoUri || !/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) {
            throw new Error("Configura MONGODB_URI con una URI valida de MongoDB.");
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }

        const users = await User.find();

        return res.status(200).json({
            total: users.length,
            datos: users,
        });
    } catch (error) {
        return res.status(500).json({
            error: "Error al consultar los usuarios",
            detalle: error.message,
        });
    }
}
