

 // =================================
 // CONSULTAR Y ACTUALIZAR PERFIL
 // =================================

const formularioPerfil = document.getElementById("formularioPerfil");

if (formularioPerfil) {

    const documento = document.getElementById("perfilDocumento").value.trim();

    // Consultar información del paciente
    async function cargarPerfil() {
        try {
            const respuesta = await fetch(
                `http://localhost:3000/api/pacientes/documento/${encodeURIComponent(documento)}`
            );

            const paciente = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(paciente.mensaje || "No se pudo cargar el perfil.");
            }

            document.getElementById("perfilTipoDocumento").value =
                paciente.tipo_documento;

            document.getElementById("perfilFecha").value =
                new Date(paciente.fecha_nacimiento).toLocaleDateString("es-CO", {
                    timeZone: "UTC"
                });

            document.getElementById("perfilTelefono").value =
                paciente.telefono || "";

            document.getElementById("perfilDireccion").value =
                paciente.direccion || "";

        } catch (error) {
            console.error("Error al cargar el perfil:", error);
            alert("No fue posible cargar los datos del paciente.");
        }
    }

    cargarPerfil();

    // Actualizar información del paciente
    formularioPerfil.addEventListener("submit", async function(event) {
        event.preventDefault();

        const datos = {
            telefono: document.getElementById("perfilTelefono").value.trim(),
            direccion: document.getElementById("perfilDireccion").value.trim()
        };

        try {
            const respuesta = await fetch(
                `http://localhost:3000/api/pacientes/documento/${encodeURIComponent(documento)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(datos)
                }
            );

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.mensaje || "No se pudieron guardar los cambios.");
            }

            alert(resultado.mensaje);

        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            alert("No fue posible guardar los cambios.");
        }
    });
}


// =================================
// CARGAR ODONTÓLOGOS DESDE MYSQL
// =================================

const selectorOdontologo = document.getElementById("odontologo");

if (selectorOdontologo) {
    fetch("http://localhost:3000/api/citas/odontologos")
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error("No se pudieron consultar los odontólogos");
            }

            return respuesta.json();
        })
        .then(odontologos => {
            selectorOdontologo.innerHTML =
                '<option value="">Seleccionar odontólogo</option>';

            odontologos.forEach(odontologo => {
                const opcion = document.createElement("option");

                opcion.value = odontologo.id_odontologo;
                opcion.textContent =
                    odontologo.especialidad + " - " +
                    odontologo.numero_documento;

                selectorOdontologo.appendChild(opcion);
            });
        })
        .catch(error => {
            console.error("Error:", error);

            selectorOdontologo.innerHTML =
                '<option value="">Error al cargar odontólogos</option>';
        });
}

// =================================
// REGISTRAR CITAS EN MYSQL
// =================================

const formularioCita = document.getElementById("formularioCita");
if (formularioCita) {
    formularioCita.addEventListener("submit", async function(event) {
        event.preventDefault();

        const datosCita = {
            documentoPaciente: document.getElementById("documentoPaciente").value.trim(),
            id_odontologo: document.getElementById("odontologo").value,
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value,
            motivo: document.getElementById("motivo").value.trim()
        };

        try {
            const respuesta = await fetch("http://localhost:3000/api/citas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosCita)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                alert(resultado.mensaje || "No se pudo registrar la cita.");
                return;
            }

            alert(resultado.mensaje);
                await cargarHistorialCitas(datosCita.documentoPaciente);
            formularioCita.reset();

        } catch (error) {
            console.error(error);
            alert("No fue posible comunicarse con el servidor.");
        }
    });
}

 // =================================
 // CONSULTAR MIS CITAS DESDE MYSQL
 // =================================

const formularioConsultaCitas =
    document.getElementById("formularioConsultaCitas");

if (formularioConsultaCitas) {
    formularioConsultaCitas.addEventListener("submit", async function(event) {
        event.preventDefault();

        const documento = document
            .getElementById("documentoConsulta")
            .value.trim();

        const lista = document.getElementById("listaMisCitas");

        lista.innerHTML = `
            <tr>
                <td colspan="4">Consultando citas...</td>
            </tr>
        `;

        try {
            const respuesta = await fetch(
                `http://localhost:3000/api/citas/mis-citas/${encodeURIComponent(documento)}`
            );

            const citas = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(citas.mensaje || "Error al consultar las citas");
            }

            if (citas.length === 0) {
                lista.innerHTML = `
                    <tr>
                        <td colspan="4">No tienes citas registradas.</td>
                    </tr>
                `;
                return;
            }

            lista.innerHTML = "";

            citas.forEach(cita => {
                const fecha = new Date(cita.fecha).toLocaleDateString("es-CO", {
                    timeZone: "UTC"
                });

                const hora = String(cita.hora).substring(0, 5);

                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${fecha}</td>
                    <td>${hora}</td>
                    <td>${cita.especialidad}</td>
                    <td>${cita.estado}</td>
                `;

                lista.appendChild(fila);
            });

        } catch (error) {
            console.error(error);

            lista.innerHTML = `
                <tr>
                    <td colspan="4">No fue posible consultar las citas.</td>
                </tr>
            `;
        }
    });
}

// =================================
// CARGAR HISTORIAL DE CITAS
// =================================

async function cargarHistorialCitas(documento) {
    const lista = document.getElementById("listaCitas");

    if (!lista || !documento) return;

    lista.innerHTML = `
        <tr>
            <td colspan="4">Consultando historial...</td>
        </tr>
    `;

    try {
        const respuesta = await fetch(
            `http://localhost:3000/api/citas/mis-citas/${encodeURIComponent(documento)}`
        );

        const citas = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(citas.mensaje || "Error al consultar");
        }

        if (citas.length === 0) {
            lista.innerHTML = `
                <tr>
                    <td colspan="4">No hay citas registradas.</td>
                </tr>
            `;
            return;
        }

        lista.innerHTML = "";

        citas.forEach(cita => {
            const fecha = new Date(cita.fecha).toLocaleDateString("es-CO", {
                timeZone: "UTC"
            });

            const hora = String(cita.hora).substring(0, 5);

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${fecha}</td>
                <td>${hora}</td>
                <td>${cita.especialidad}</td>
                <td>${cita.estado}</td>
            `;

            lista.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al cargar historial:", error);

        lista.innerHTML = `
            <tr>
                <td colspan="4">No fue posible cargar el historial.</td>
            </tr>
        `;
    }
}

// =================================
// REGISTRAR PACIENTES EN MYSQL
// =================================

const formularioPaciente = document.getElementById("formularioPaciente");

if (formularioPaciente) {
    formularioPaciente.addEventListener("submit", async function(event) {
        event.preventDefault();

        const datosPaciente = {
            tipo_documento: document.getElementById("tipoDocumento").value,
            numero_documento: document.getElementById("numeroDocumento").value.trim(),
            fecha_nacimiento: document.getElementById("fechaNacimiento").value,
            telefono: document.getElementById("telefonoPaciente").value.trim(),
            direccion: document.getElementById("direccionPaciente").value.trim()
        };

        try {
            const respuesta = await fetch("http://localhost:3000/api/pacientes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosPaciente)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                alert(resultado.mensaje || "No se pudo registrar el paciente.");
                return;
            }

            alert(resultado.mensaje);
            formularioPaciente.reset();
            await cargarPacientes();

        } catch (error) {
            console.error("Error:", error);
            alert("No fue posible comunicarse con el servidor.");
        }
    });
}

// =================================
// CONSULTAR PACIENTES DESDE MYSQL
// =================================

async function cargarPacientes() {
    const lista = document.getElementById("listaPacientes");

    if (!lista) return;

    try {
        const respuesta = await fetch("http://localhost:3000/api/pacientes");
        const pacientes = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar los pacientes.");
        }

        if (pacientes.length === 0) {
            lista.innerHTML = `
                <tr>
                    <td colspan="4">No hay pacientes registrados.</td>
                </tr>
            `;
            return;
        }

        lista.innerHTML = "";

        pacientes.forEach(paciente => {
            const fecha = new Date(paciente.fecha_nacimiento)
                .toLocaleDateString("es-CO", { timeZone: "UTC" });

            const fila = document.createElement("tr");

            [
                paciente.numero_documento,
                paciente.tipo_documento,
                fecha,
                paciente.telefono || "No registrado"
            ].forEach(valor => {
                const celda = document.createElement("td");
                celda.textContent = valor;
                fila.appendChild(celda);
            });

            lista.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al consultar pacientes:", error);

        lista.innerHTML = `
            <tr>
                <td colspan="4">No fue posible cargar los pacientes.</td>
            </tr>
        `;
    }
}

// Cargar pacientes al abrir la página
cargarPacientes();

// =================================
// MOSTRAR ODONTÓLOGOS DESDE MYSQL
// =================================

async function cargarOdontologos() {
    const lista = document.getElementById("listaOdontologos");

    if (!lista) return;

    try {
        const respuesta = await fetch(
            "http://localhost:3000/api/citas/odontologos"
        );

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar los odontólogos.");
        }

        const odontologos = await respuesta.json();

        lista.innerHTML = "";

        if (odontologos.length === 0) {
            lista.innerHTML = "<p>No hay odontólogos registrados.</p>";
            return;
        }

        odontologos.forEach(odontologo => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-odontologo";

            tarjeta.innerHTML = `
                <div class="foto-odontologo fondo-azul">👨‍⚕️</div>
                <span class="especialidad"></span>
                <h2>Profesional odontológico</h2>
                <p class="documento-odontologo"></p>
                <a href="citas.html" class="enlace-odontologo">
                    Agendar cita →
                </a>
            `;

            tarjeta.querySelector(".especialidad").textContent =
                odontologo.especialidad;

            tarjeta.querySelector(".documento-odontologo").textContent =
                "Documento: " + odontologo.numero_documento;

            lista.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar odontólogos:", error);
        lista.innerHTML = "<p>No fue posible cargar los odontólogos.</p>";
    }
}

cargarOdontologos();

// =================================
// CONSULTAR HISTORIAL CLÍNICO
// =================================

const formularioHistorial =
    document.getElementById("formularioHistorial");

if (formularioHistorial) {
    formularioHistorial.addEventListener("submit", async function(event) {
        event.preventDefault();

        const documento = document
            .getElementById("documentoHistorial")
            .value.trim();

        const panelPaciente = document.getElementById("panelInformacionHistorial");
        const panelAntecedentes = document.getElementById("panelAntecedentes");
        const panelAtenciones = document.getElementById("panelAtenciones");

        panelPaciente.hidden = true;
        panelAntecedentes.hidden = true;
        panelAtenciones.hidden = true;

        try {
            const respuesta = await fetch(
                `http://localhost:3000/api/historias/${encodeURIComponent(documento)}`
            );

            const paciente = await respuesta.json();

            if (!respuesta.ok) {
                alert(paciente.mensaje || "No se encontró el paciente.");
                return;
            }

            const datos = document.getElementById("datosPacienteHistorial");

            datos.innerHTML = "";

            const campos = [
                ["Documento", paciente.numero_documento],
                ["Tipo de documento", paciente.tipo_documento],
                ["Fecha de nacimiento", paciente.fecha_nacimiento
                    ? new Date(paciente.fecha_nacimiento).toLocaleDateString("es-CO", {timeZone: "UTC"})
                    : "No registrado"],
                ["Teléfono", paciente.telefono || "No registrado"],
                ["Dirección", paciente.direccion || "No registrada"]
            ];

            campos.forEach(([titulo, valor]) => {
                const elemento = document.createElement("div");
                elemento.className = "dato";

                const etiqueta = document.createElement("span");
                etiqueta.textContent = titulo;

                const contenido = document.createElement("strong");
                contenido.textContent = valor;

                elemento.append(etiqueta, contenido);
                datos.appendChild(elemento);
            });

            const antecedentes = document.getElementById("datosAntecedentes");
            antecedentes.innerHTML = "";

            [
                ["Antecedentes", paciente.antecedentes],
                ["Alergias", paciente.alergias]
            ].forEach(([titulo, valor]) => {
                const elemento = document.createElement("div");
                elemento.className = "antecedente";

                const detalle = document.createElement("div");
                const nombre = document.createElement("strong");
                nombre.textContent = titulo;

                const texto = document.createElement("p");
                texto.textContent = valor || "Sin información registrada.";

                detalle.append(nombre, texto);
                elemento.appendChild(detalle);
                antecedentes.appendChild(elemento);
            });

            panelPaciente.hidden = false;
            panelAntecedentes.hidden = false;

            // Consultar atenciones
            const respuestaAtenciones = await fetch(
                `http://localhost:3000/api/historias/${encodeURIComponent(documento)}/atenciones`
            );

            const atenciones = await respuestaAtenciones.json();

            if (!respuestaAtenciones.ok) {
                throw new Error("No se pudieron consultar las atenciones.");
            }

            const lista = document.getElementById("listaAtenciones");
            lista.innerHTML = "";

            if (atenciones.length === 0) {
                lista.textContent = "Este paciente todavía no tiene atenciones registradas.";
            } else {
                atenciones.forEach(atencion => {
                    const tarjeta = document.createElement("div");
                    tarjeta.className = "registro-atencion";

                    const detalle = document.createElement("div");
                    detalle.className = "detalle-registro";

                    const titulo = document.createElement("h3");
                    titulo.textContent = atencion.diagnostico || "Sin diagnóstico registrado";

                    const observaciones = document.createElement("p");
                    observaciones.textContent = atencion.observaciones || "Sin observaciones.";

                    const fecha = document.createElement("span");
                    fecha.textContent = atencion.fecha_atencion
                        ? new Date(atencion.fecha_atencion).toLocaleDateString("es-CO", {timeZone: "UTC"})
                        : "Fecha no registrada";

                    detalle.append(titulo, observaciones, fecha);
                    tarjeta.appendChild(detalle);
                    lista.appendChild(tarjeta);
                });
            }

            panelAtenciones.hidden = false;

        } catch (error) {
            console.error("Error al consultar historial:", error);
            alert("No fue posible consultar el historial clínico.");
        }
    });
}

// =================================
// CARGAR TRATAMIENTOS DESDE MYSQL
// =================================

const listaTratamientos =
    document.getElementById("listaTratamientos");

if (listaTratamientos) {
    fetch("http://localhost:3000/api/tratamientos")
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error("No se pudieron cargar los tratamientos.");
            }

            return respuesta.json();
        })
        .then(tratamientos => {
            listaTratamientos.innerHTML = "";

            if (tratamientos.length === 0) {
                listaTratamientos.textContent =
                    "No hay tratamientos registrados.";
                return;
            }

            const fondos = [
                "fondo-azul",
                "fondo-verde",
                "fondo-morado",
                "fondo-naranja",
                "fondo-rosa",
                "fondo-celeste"
            ];

            const iconos = ["🦷", "✨", "🩺", "😁", "🦷", "👨‍⚕️"];

            tratamientos.forEach((tratamiento, indice) => {
                const tarjeta = document.createElement("article");
                tarjeta.className = "tarjeta-tratamiento";

                const icono = document.createElement("div");
                icono.className =
                    `icono-tratamiento ${fondos[indice % fondos.length]}`;
                icono.textContent = iconos[indice % iconos.length];

                const titulo = document.createElement("h2");
                titulo.textContent = tratamiento.nombre;

                const descripcion = document.createElement("p");
                descripcion.textContent =
                    tratamiento.descripcion || "Sin descripción disponible.";

                tarjeta.append(icono, titulo, descripcion);
                listaTratamientos.appendChild(tarjeta);
            });
        })
        .catch(error => {
            console.error("Error:", error);
            listaTratamientos.textContent =
                "No fue posible cargar los tratamientos.";
        });
}
