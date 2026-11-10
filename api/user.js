import User from "../models/User.js";
import connectToDatabase from "../lib/mongodb.js";
import { respuestaError } from "../lib/apiError.js";

const rolesValidos = new Set(["cliente", "barbero", "admin"]);

function obtenerParametro(query, nombre) {
    const valor = query?.[nombre];
    return typeof valor === "string" ? valor.trim() : "";
}

function escaparRegex(valor) {
    return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Método no permitido" });
    }

    const query = req.query ?? {};
    const rolFiltro = obtenerParametro(query, "rol").toLowerCase();
    const nombreFiltro = obtenerParametro(query, "nombre");
    const paginaTexto = obtenerParametro(query, "pagina");
    const limiteTexto = obtenerParametro(query, "limite");

    if (query.rol !== undefined && !rolesValidos.has(rolFiltro)) {
        return res.status(400).json({
            error: "El filtro rol debe ser cliente, barbero o admin"
        });
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
    if (rolFiltro) {
        filtro.rol = rolFiltro;
    }
    if (nombreFiltro) {
        filtro.nombre = { $regex: escaparRegex(nombreFiltro), $options: "i" };
    }

    try {
        await connectToDatabase();

        const [total, usuarios] = await Promise.all([
            User.countDocuments(filtro),
            User.find(filtro)
                .select("nombre rol avatar especialidad fechaRegistro")
                .sort({ nombre: 1 })
                .skip((pagina - 1) * limite)
                .limit(limite)
                .lean()
        ]);

        return res.status(200).json({
            total,
            filtrosAplicados: filtro,
            pagina,
            limite,
            datos: usuarios
        });
    } catch (error) {
        console.error("Error al consultar usuarios:", error);
        return respuestaError(res, error);
    }
}
