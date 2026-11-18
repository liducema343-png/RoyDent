
const express = require("express");
const router = express.Router();
const conexion = require("../config/database");

// Consultar pacientes
router.get("/pacientes", (req, res) => {
    conexion.query(
        "SELECT id_paciente, numero_documento, tipo_documento FROM paciente",
        (error, resultados) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            res.json(resultados);
        }
    );
});

// Consultar odontólogos
router.get("/odontologos", (req, res) => {
    conexion.query(
        "SELECT id_odontologo, numero_documento, especialidad FROM odontologo",
        (error, resultados) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            res.json(resultados);
        }
    );
});

// Registrar una nueva cita
router.post("/", (req, res) => {
    const {
        documentoPaciente,
        id_odontologo,
        fecha,
        hora,
        motivo
    } = req.body;

    if (!documentoPaciente || !id_odontologo || !fecha || !hora) {
        return res.status(400).json({
            mensaje: "Completa todos los campos obligatorios."
        });
    }

    // Buscar al paciente por su documento
    conexion.query(
        "SELECT id_paciente FROM paciente WHERE numero_documento = ?",
        [documentoPaciente],
        (error, pacientes) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            if (pacientes.length === 0) {
                return res.status(404).json({
                    mensaje: "No encontramos un paciente con ese documento."
                });
            }

            const idPaciente = pacientes[0].id_paciente;

            // Guardar la cita en MySQL
            const sql = `
                INSERT INTO cita
                (id_paciente, id_odontologo, fecha, hora, motivo, estado)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            conexion.query(
                sql,
                [
                    idPaciente,
                    id_odontologo,
                    fecha,
                    hora,
                    motivo || null,
                    "Pendiente"
                ],
                (error, resultado) => {
                    if (error) {
                        return res.status(500).json({
                            mensaje: "No se pudo registrar la cita.",
                            error: error.message
                        });
                    }

                    res.status(201).json({
                        mensaje: "¡Cita registrada correctamente!",
                        id_cita: resultado.insertId
                    });
                }
            );
        }
    );
});

// Consultar citas de un paciente por número de documento
router.get("/mis-citas/:documento", (req, res) => {
    const documento = req.params.documento;

    const sql = `
        SELECT
            c.id_cita,
            c.fecha,
            c.hora,
            c.motivo,
            c.estado,
            o.especialidad,
            o.numero_documento AS documento_odontologo
        FROM cita c
        INNER JOIN paciente p
            ON c.id_paciente = p.id_paciente
        INNER JOIN odontologo o
            ON c.id_odontologo = o.id_odontologo
        WHERE p.numero_documento = ?
        ORDER BY c.fecha DESC, c.hora DESC
    `;

    conexion.query(sql, [documento], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al consultar las citas.",
                error: error.message
            });
        }

        res.json(resultados);
    });
});

module.exports = router;
