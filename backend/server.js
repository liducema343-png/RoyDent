
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const conexion = require("./config/database");
const citasRoutes = require("./routes/citas.routes");
const pacientesRoutes = require("./routes/pacientes.routes");
const historiasRoutes = require("./routes/historias.routes");
const tratamientosRoutes = require("./routes/tratamientos.routes");
const authRoutes = require("./routes/auth.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/citas", citasRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/historias", historiasRoutes);
app.use("/api/tratamientos", tratamientosRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
    res.send("Servidor de RoyDent funcionando correctamente.");
});

app.get("/api/prueba-db", (req, res) => {
    conexion.query("SELECT DATABASE() AS base_datos", (error, resultados) => {
        if (error) {
            console.error("Error de MySQL:", error.message);
            return res.status(500).json({
                mensaje: "No fue posible conectar con MySQL",
                error: error.message
            });
        }

        res.json({
            mensaje: "¡Conexión exitosa con MySQL!",
            base_datos: resultados[0].base_datos
        });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`RoyDent funcionando en http://localhost:${PORT}`);
});
