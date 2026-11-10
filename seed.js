import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const clientes = [
    "Alejandro García", "Daniel Fernández", "Pablo Martínez",
    "Carlos López", "Javier Sánchez", "Adrián Pérez",
    "David Gómez", "Sergio Martín", "Álvaro Jiménez",
    "Manuel Ruiz", "Hugo Hernández", "Mario Díaz",
    "Diego Moreno", "Lucas Muñoz", "Marcos Álvarez",
    "Nicolás Romero", "Gabriel Alonso", "Iván Gutiérrez",
    "Raúl Navarro", "Fernando Torres", "Antonio Domínguez",
    "Miguel Vázquez", "Óscar Ramos", "Rubén Gil",
    "Andrés Serrano", "Francisco Molina", "Enrique Castro",
    "Jorge Ortiz", "Alberto Rubio", "Pedro Marín",
    "Víctor Iglesias", "Eduardo Medina", "Samuel Cortés",
    "Tomás Castillo", "Guillermo Santos", "Ignacio Guerrero",
    "Ángel Flores", "Ramón Peña", "Emilio Cabrera",
    "Juan Delgado", "Mateo León", "Eric Márquez",
    "Alex Fuentes", "Cristian Vega", "Héctor Campos",
    "Ismael Reyes", "Gonzalo Vidal", "Bruno Pascual",
    "Aitor Soler", "Joel Carrasco"
];

const fechaRegistro = new Date();

const usuarios = clientes.map((nombre, index) => {
    const numero = index + 1;

    return {
        nombre,
        email: `cliente${numero}@example.com`,
        telefono: `600${String(numero).padStart(6, "0")}`,
        rol: "cliente",
        avatar: `https://i.pravatar.cc/150?img=${numero}`,
        fechaRegistro: new Date(2025, index % 12, (index % 28) + 1)
    };
});

const barberos = [
    {
        nombre: "Jose Maria",
        email: "josemaria@example.com",
        telefono: "611000001",
        rol: "barbero",
        avatar: "https://i.pravatar.cc/150?img=60",
        especialidad: "Barbero profesional - 5 años de experiencia",
        fechaRegistro: new Date("2020-01-15")
    },
    {
        nombre: "Maria Jose",
        email: "mariajose@example.com",
        telefono: "611000002",
        rol: "barbero",
        avatar: "https://i.pravatar.cc/150?img=47",
        especialidad: "Barbera profesional - 3 años de experiencia",
        fechaRegistro: new Date("2023-01-15")
    }
];

async function seedUsers() {
    if (!process.env.MONGODB_URI) {
        console.error("Error: configura MONGODB_URI en el archivo .env.");
        process.exitCode = 1;
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Conectado a MongoDB");

        await User.deleteMany({
            rol: { $in: ["cliente", "barbero"] }
        });

        const insertados = await User.insertMany([...usuarios, ...barberos]);
        console.log(`${insertados.length} usuarios creados correctamente.`);
        console.log("50 clientes y 2 barberos.");
    } catch (error) {
        console.error("Error creando usuarios:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log("Desconectado de MongoDB");
        }
    }
}

await seedUsers();
