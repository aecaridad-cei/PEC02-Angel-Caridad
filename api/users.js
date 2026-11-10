import mongoose from "mongoose";
import User from "../models/User.js";

// Punto de entrada de la nuestra Api: recibe una peticion HTTP y construye una respuesta JSON

export default async function handler(req, res) {
    try {
    // Abre la conexion solo si no existe una activa; evita reconectar en cada peticion
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
    
    const users = await User.find();

    return res.status(200).json({
        total: users.length,
        datos: users,
    });
    } catch (error) {
    // Si falla la conexion o la consulta, devuelve un error HTTP 500 con el detalle disponible
    return res.status(500).json({
        error: "Error al consultar la base de datos",
        detalle: error.message,
    });
    }
}
