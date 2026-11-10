import mongoose from "mongoose";
import Appointment from "../models/Appointments.js";

// Punto de entrada de la nuestra Api: recibe una peticion HTTP y construye una respuesta JSON

export default async function handler(req, res) {
    try {
    // Abre la conexion solo si no existe una activa; evita reconectar en cada peticion
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

    // Abre la conexion solo si no existe una activa; evita reconectar en cada peticion
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }

    const appointments = await Appointment.find();

    return res.status(200).json({
        total: appointments.length,
        datos: appointments,
    });
    } catch (error) {
    // Si falla la conexion o la consulta, devuelve un error HTTP 500 con el detalle disponible
    return res.status(500).json({
        error: "Error al consultar la base de datos",
        detalle: error.message,
    });
    }
}