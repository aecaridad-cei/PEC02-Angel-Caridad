import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        telefono: {
            type: String,
            required: true
        },
        rol: {
            type: String,
            enum: ["cliente", "barbero", "admin"],
            required: true
        },
        avatar: {
            type: String
        },
        especialidad: {
            type: String
        },
        fechaRegistro: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User