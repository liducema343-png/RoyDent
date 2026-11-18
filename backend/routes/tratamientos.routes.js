
const express = require("express");
const router = express.Router();
const conexion = require("../config/database");

// Consultar tratamientos disponibles
router.get("/", (req, res) => {
    const sql = `
        SELECT id_tratamiento, nombre, descripcion
        FROM tratamiento
        ORDER BY id_tratamiento ASC
    `;

    conexion.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al consultar los tratamientos.",
                error: error.message
            });
        }

        res.json(resultados);
    });
});

module.exports = router;
