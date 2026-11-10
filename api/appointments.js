import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import Appointment from "../models/Appointments.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Metodo no permitido" });
    }

    try {
        const mongoUri = process.env.MONGODB_URI?.trim();
        if (!mongoUri) {
            throw new Error("No se encontro MONGODB_URI. Configurala en .env o en las variables de entorno del hosting.");
        }
        if (!/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) {
            throw new Error("MONGODB_URI debe comenzar por mongodb:// o mongodb+srv://.");
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }

        const appointments = await Appointment.find();

        return res.status(200).json({
            total: appointments.length,
            datos: appointments,
        });
    } catch (error) {
        return res.status(500).json({
            error: "Error al consultar las citas",
            detalle: error.message,
        });
    }
}
//