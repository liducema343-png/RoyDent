
const express = require("express");
const router = express.Router();
const conexion = require("../config/database");

// =================================
// CONSULTAR HISTORIAL CLÍNICO
// =================================

router.get("/:documento", (req, res) => {
    const documento = req.params.documento;

    const sql = `
        SELECT
            p.id_paciente,
            p.numero_documento,
            p.tipo_documento,
            p.fecha_nacimiento,
            p.telefono,
            p.direccion,
            h.id_historia,
            h.antecedentes,
            h.alergias,
            h.fecha_apertura
        FROM paciente p
        LEFT JOIN historia_clinica h
            ON p.id_paciente = h.id_paciente
        WHERE p.numero_documento = ?
    `;

    conexion.query(sql, [documento], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al consultar el historial clínico.",
                error: error.message
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "No encontramos un paciente con ese documento."
            });
        }

        res.json(resultados[0]);
    });
});

// =================================
// CONSULTAR ATENCIONES DEL PACIENTE
// =================================

router.get("/:documento/atenciones", (req, res) => {
    const documento = req.params.documento;

    const sql = `
        SELECT
            a.id_atencion,
            a.diagnostico,
            a.observaciones,
            a.fecha_atencion,
            c.fecha AS fecha_cita,
            o.especialidad
        FROM atencion a
        INNER JOIN cita c
            ON a.id_cita = c.id_cita
        INNER JOIN paciente p
            ON c.id_paciente = p.id_paciente
        INNER JOIN odontologo o
            ON c.id_odontologo = o.id_odontologo
        WHERE p.numero_documento = ?
        ORDER BY a.fecha_atencion DESC
    `;

    conexion.query(sql, [documento], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al consultar las atenciones.",
                error: error.message
            });
        }

        res.json(resultados);
    });
});

module.exports = router;
