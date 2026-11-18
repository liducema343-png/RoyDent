
const express = require("express");
const router = express.Router();
const conexion = require("../config/database");

// Consultar todos los pacientes
router.get("/", (req, res) => {
    const sql = `
        SELECT
            id_paciente,
            tipo_documento,
            numero_documento,
            fecha_nacimiento,
            telefono,
            direccion
        FROM paciente
        ORDER BY id_paciente DESC
    `;

    conexion.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al consultar pacientes",
                error: error.message
            });
        }

        res.json(resultados);
    });
});

// Registrar un paciente
router.post("/", (req, res) => {
    const {
        tipo_documento,
        numero_documento,
        fecha_nacimiento,
        telefono,
        direccion
    } = req.body;

    if (!tipo_documento || !numero_documento || !fecha_nacimiento) {
        return res.status(400).json({
            mensaje: "Completa los campos obligatorios."
        });
    }

    const sql = `
        INSERT INTO paciente
        (tipo_documento, numero_documento, fecha_nacimiento, telefono, direccion)
        VALUES (?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            tipo_documento,
            numero_documento.trim(),
            fecha_nacimiento,
            telefono || null,
            direccion || null
        ],
        (error, resultado) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "Ya existe un paciente con ese número de documento."
                    });
                }

                return res.status(500).json({
                    mensaje: "No se pudo registrar el paciente.",
                    error: error.message
                });
            }

            res.status(201).json({
                mensaje: "¡Paciente registrado correctamente!",
                id_paciente: resultado.insertId
            });
        }
    );
});

// Consultar un paciente por número de documento
router.get("/documento/:documento", (req, res) => {
    const documento = req.params.documento;

    const sql = `
        SELECT
            id_paciente,
            tipo_documento,
            numero_documento,
            fecha_nacimiento,
            telefono,
            direccion
        FROM paciente
        WHERE numero_documento = ?
    `;

    conexion.query(sql, [documento], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al consultar el paciente.",
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

// Actualizar datos de un paciente
router.put("/documento/:documento", (req, res) => {
    const documento = req.params.documento;

    const { telefono, direccion } = req.body;

    const sql = `
        UPDATE paciente
        SET telefono = ?, direccion = ?
        WHERE numero_documento = ?
    `;

    conexion.query(
        sql,
        [telefono || null, direccion || null, documento],
        (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    mensaje: "No se pudieron actualizar los datos.",
                    error: error.message
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "No encontramos el paciente."
                });
            }

            res.json({
                mensaje: "¡Datos del paciente actualizados correctamente!"
            });
        }
    );
});

module.exports = router;
