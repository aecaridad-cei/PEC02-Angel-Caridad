import mongoose from "mongoose";
import dotenv from "dotenv";
import Appointments from "./models/Appointments.js";
import User from "./models/User.js";

dotenv.config();

const marcaSeed = "Cita de ejemplo semanal:";
const horas = ["09:00", "10:30", "12:00", "16:00", "17:30"];
const servicios = [
    { nombre: "Corte clásico", precio: 15, duracionMinutos: 30 },
    { nombre: "Corte y barba", precio: 25, duracionMinutos: 45 },
    { nombre: "Arreglo de barba", precio: 12, duracionMinutos: 25 }
];

function obtenerLunesDeEstaSemana() {
    const hoy = new Date();
    const lunes = new Date(Date.UTC(
        hoy.getUTCFullYear(),
        hoy.getUTCMonth(),
        hoy.getUTCDate()
    ));
    const diasDesdeLunes = (lunes.getUTCDay() + 6) % 7;
    lunes.setUTCDate(lunes.getUTCDate() - diasDesdeLunes);
    return lunes;
}

function fechaDeLaSemana(lunes, dia) {
    const fecha = new Date(lunes);
    fecha.setUTCDate(fecha.getUTCDate() + dia);
    return fecha;
}

function crearCita({ index, lunes, clientes, barberos, ahora, hoy }) {
    const dia = index % 7;
    const turno = Math.floor(index / 7);
    const fecha = fechaDeLaSemana(lunes, dia);
    const fechaTexto = fecha.toISOString().slice(0, 10);
    const hoyTexto = hoy.toISOString().slice(0, 10);
    let estado;

    if (index % 10 === 9) {
        estado = "cancelada";
    } else if (fechaTexto < hoyTexto) {
        estado = "completada";
    } else {
        estado = index % 2 === 0 ? "confirmada" : "pendiente";
    }

    return {
        clienteId: clientes[index]._id,
        barberoId: barberos[(dia + turno) % barberos.length]._id,
        servicio: servicios[index % servicios.length],
        fecha,
        horaInicio: horas[turno],
        estado,
        notas: `${marcaSeed} ${fechaTexto} #${String(index + 1).padStart(2, "0")}`,
        creadoEn: ahora
    };
}

async function seedAppointments() {
    if (!process.env.MONGODB_URI) {
        throw new Error("Configura MONGODB_URI en el archivo .env antes de ejecutar el seed.");
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Conectado a MongoDB");

        const [clientes, joseMaria, mariaJose] = await Promise.all([
            User.find({ rol: "cliente" }).sort({ email: 1 }).limit(30).select("_id").lean(),
            User.findOne({ rol: "barbero", email: "josemaria@example.com" }).select("_id").lean(),
            User.findOne({ rol: "barbero", email: "mariajose@example.com" }).select("_id").lean()
        ]);

        if (clientes.length < 30) {
            throw new Error("Se necesitan al menos 30 clientes. Ejecuta primero node seed.js.");
        }
        if (!joseMaria || !mariaJose) {
            throw new Error("No se encontraron los dos barberos. Ejecuta primero node seed.js.");
        }

        const ahora = new Date();
        const hoy = new Date(Date.UTC(
            ahora.getUTCFullYear(),
            ahora.getUTCMonth(),
            ahora.getUTCDate()
        ));
        const lunes = obtenerLunesDeEstaSemana();
        const citas = Array.from({ length: 30 }, (_, index) =>
            crearCita({
                index,
                lunes,
                clientes,
                barberos: [joseMaria, mariaJose],
                ahora,
                hoy
            })
        );

        await Appointments.deleteMany({
            notas: { $regex: "^Cita de ejemplo semanal:" }
        });
        const insertadas = await Appointments.insertMany(citas);

        console.log(`${insertadas.length} citas de ejemplo creadas para la semana actual.`);
        console.log("Consúltalas en GET /api/appointments.");
    } catch (error) {
        console.error("Error creando citas de ejemplo:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log("Desconectado de MongoDB");
        }
    }
}

await seedAppointments();
