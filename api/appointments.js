import mongoose from "mongoose";
import Appointments from "../models/Appointments.js";
import User from "../models/User.js";
import connectToDatabase from "../lib/mongodb.js";
import { respuestaError } from "../lib/apiError.js";

const estadosValidos = new Set([
    "pendiente",
    "confirmada",
    "completada",
    "cancelada"
]);

function obtenerParametro(query, nombre) {
    const valor = query?.[nombre];
    return typeof valor === "string" ? valor.trim() : "";
}

function esFechaValida(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return false;
    }

    const fechaParseada = new Date(`${fecha}T00:00:00.000Z`);
    return !Number.isNaN(fechaParseada.getTime())
        && fechaParseada.toISOString().slice(0, 10) === fecha;
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Método no permitido" });
    }

    const query = req.query ?? {};
    const estado = obtenerParametro(query, "estado").toLowerCase();
    const clienteId = obtenerParametro(query, "clienteId");
    const barberoId = obtenerParametro(query, "barberoId");
    const fecha = obtenerParametro(query, "fecha");
    const paginaTexto = obtenerParametro(query, "pagina");
    const limiteTexto = obtenerParametro(query, "limite");

    if (query.estado !== undefined && !estadosValidos.has(estado)) {
        return res.status(400).json({
            error: "El filtro estado debe ser pendiente, confirmada, completada o cancelada"
        });
    }

    if (clienteId && !mongoose.isValidObjectId(clienteId)) {
        return res.status(400).json({ error: "clienteId no es un ObjectId válido" });
    }

    if (barberoId && !mongoose.isValidObjectId(barberoId)) {
        return res.status(400).json({ error: "barberoId no es un ObjectId válido" });
    }

    if (fecha && !esFechaValida(fecha)) {
        return res.status(400).json({ error: "fecha debe tener el formato YYYY-MM-DD" });
    }

    const pagina = paginaTexto ? Number(paginaTexto) : 1;
    const limite = limiteTexto ? Number(limiteTexto) : 50;

    if (!Number.isInteger(pagina) || pagina < 1) {
        return res.status(400).json({ error: "pagina debe ser un entero mayor que 0" });
    }

    if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
        return res.status(400).json({ error: "limite debe ser un entero entre 1 y 100" });
    }

    const filtro = {};
    if (estado) {
        filtro.estado = estado;
    }
    if (clienteId) {
        filtro.clienteId = new mongoose.Types.ObjectId(clienteId);
    }
    if (barberoId) {
        filtro.barberoId = new mongoose.Types.ObjectId(barberoId);
    }
    if (fecha) {
        const inicio = new Date(`${fecha}T00:00:00.000Z`);
        const fin = new Date(inicio);
        fin.setUTCDate(fin.getUTCDate() + 1);
        filtro.fecha = { $gte: inicio, $lt: fin };
    }

    try {
        await connectToDatabase();

        const [total, citas] = await Promise.all([
            Appointments.countDocuments(filtro),
            Appointments.find(filtro)
                .populate({ path: "clienteId", select: "nombre avatar", model: User })
                .populate({ path: "barberoId", select: "nombre avatar especialidad", model: User })
                .sort({ fecha: 1, horaInicio: 1 })
                .skip((pagina - 1) * limite)
                .limit(limite)
                .lean()
        ]);

        return res.status(200).json({
            total,
            filtrosAplicados: filtro,
            pagina,
            limite,
            datos: citas
        });
    } catch (error) {
        console.error("Error al consultar citas:", error);
        return respuestaError(res, error);
    }
}
