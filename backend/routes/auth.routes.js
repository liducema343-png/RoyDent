
const express = require("express");
const router = express.Router();
const conexion = require("../config/database");
const bcrypt = require("bcryptjs");

// =================================
// REGISTRAR NUEVO USUARIO
// =================================

router.post("/registro", async (req, res) => {
    console.log("Datos recibidos:", req.body);
    const { nombre_usuario, correo, password } = req.body;

    // Validar campos obligatorios
    if (!nombre_usuario || !correo || !password) {
        return res.status(400).json({
            mensaje: "Completa todos los campos obligatorios."
        });
    }

    try {
        // Verificar si el correo ya está registrado
        conexion.query(
            "SELECT id_usuario FROM usuario WHERE correo = ?",
            [correo.trim()],
            async (error, resultados) => {
                if (error) {
                    return res.status(500).json({
                        mensaje: "Error al verificar el usuario."
                    });
                }

                if (resultados.length > 0) {
                    return res.status(409).json({
                        mensaje: "Este correo ya se encuentra registrado."
                    });
                }

                // Proteger la contraseña antes de guardarla
                const contraseñaHash = await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO usuario
                    (nombre_usuario, correo, contraseña, rol, estado)
                    VALUES (?, ?, ?, ?, ?)
                `;

                conexion.query(
                    sql,
                    [
                        nombre_usuario.trim(),
                        correo.trim(),
                        contraseñaHash,
                        "Paciente",
                        "Activo"
                    ],
                    (error, resultado) => {
                        if (error) {
                            return res.status(500).json({
                                mensaje: "No se pudo registrar el usuario."
                            });
                        }

                        res.status(201).json({
                            mensaje: "Usuario registrado correctamente.",
                            id_usuario: resultado.insertId
                        });
                    }
                );
            }
        );

    } catch (error) {
        res.status(500).json({
            mensaje: "Error en el registro del usuario."
        });
    }
});

// =================================
// INICIAR SESIÓN
// =================================

router.post("/login", (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({
            mensaje: "Ingresa el correo y la contraseña."
        });
    }

    const sql = `
        SELECT id_usuario, nombre_usuario, correo,
               contraseña, rol, estado
        FROM usuario
        WHERE correo = ?
    `;

    conexion.query(sql, [correo.trim()], async (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al consultar el usuario."
            });
        }

        if (resultados.length === 0) {
            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos."
            });
        }

        const usuario = resultados[0];

        if (usuario.estado !== "Activo") {
            return res.status(403).json({
                mensaje: "La cuenta se encuentra inactiva."
            });
        }

        try {
            // Comparar la contraseña ingresada con el hash guardado
            const contraseñaValida = await bcrypt.compare(
                password,
                usuario.contraseña
                );

            if (!contraseñaValida) {
                return res.status(401).json({
                    mensaje: "Correo o contraseña incorrectos."
                });
            }

            res.json({
                mensaje: "Inicio de sesión exitoso.",
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre_usuario: usuario.nombre_usuario,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });

        } catch (error) {
            res.status(500).json({
                mensaje: "Error durante la autenticación."
            });
        }
    });
});

module.exports = router;
