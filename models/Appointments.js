import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        precio: {
            type: Number,
            required: true
        },
        duracionMinutos: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);

const appointmentsSchema = new mongoose.Schema(
    {
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        barberoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        servicio: {
            type: serviceSchema,
            required: true
        },
        fecha: {
            type: Date,
            required: true
        },
        horaInicio: {
            type: String,
            required: true
        },
        estado: {
            type: String,
            enum: ["pendiente", "confirmada", "completada", "cancelada"],
            required: true
        },
        notas: {
            type: String
        },
        creadoEn: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Appointments = mongoose.models.Appointments || mongoose.model("Appointments", appointmentsSchema);

export default Appointments;
