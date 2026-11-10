function obtenerDetalle(error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    return mensaje.replace(/mongodb(?:\+srv)?:\/\/[^@\s]+@/gi, "mongodb+srv://[credenciales]@");
}

export function respuestaError(res, error) {
    const respuesta = { error: "Error al consultar la base de datos" };

    if (process.env.NODE_ENV !== "production") {
        respuesta.detalle = obtenerDetalle(error);
    }

    return res.status(500).json(respuesta);
}
