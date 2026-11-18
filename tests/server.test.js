
const request = require("supertest");
const app = require("../backend/app");
const conexion = require("../backend/config/database");

describe("Pruebas automatizadas de RoyDent", () => {

    test("Debe consultar los tratamientos disponibles", async () => {
        const respuesta = await request(app)
            .get("/api/tratamientos");

        expect(respuesta.statusCode).toBe(200);
        expect(Array.isArray(respuesta.body)).toBe(true);
        expect(respuesta.body.length).toBeGreaterThan(0);
        expect(respuesta.body[0]).toHaveProperty("nombre");
        expect(respuesta.body[0]).toHaveProperty("descripcion");
    });

    test("Debe consultar los pacientes registrados", async () => {
        const respuesta = await request(app)
            .get("/api/pacientes");

        expect(respuesta.statusCode).toBe(200);
        expect(Array.isArray(respuesta.body)).toBe(true);

        if (respuesta.body.length > 0) {
            expect(respuesta.body[0]).toHaveProperty("id_paciente");
            expect(respuesta.body[0]).toHaveProperty("numero_documento");
        }
    });
test("Debe consultar la historia clínica de un paciente", async () => {
    const respuesta = await request(app)
        .get("/api/historias/1028400513");

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toHaveProperty("id_paciente");
    expect(respuesta.body).toHaveProperty("numero_documento");
});
test("Debe consultar los pacientes disponibles para citas", async () => {
    const respuesta = await request(app)
        .get("/api/citas/pacientes");

    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
});
test("Debe consultar los odontólogos disponibles", async () => {
    const respuesta = await request(app)
        .get("/api/citas/odontologos");

    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
});
test("Debe consultar las citas de un paciente", async () => {
    const respuesta = await request(app)
        .get("/api/citas/mis-citas/1028400513");

    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
});
test("Debe rechazar el inicio de sesión con datos incorrectos", async () => {
    const respuesta = await request(app)
        .post("/api/auth/login")
        .send({
            correo: "correo_inexistente@roydent.com",
            password: "ClaveIncorrecta123"
        });

    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.body).toHaveProperty("mensaje");
});
test("Debe consultar un paciente por su documento", async () => {
    const respuesta = await request(app)
        .get("/api/pacientes/documento/1028400513");

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.numero_documento).toBe("1028400513");
});
test("Debe rechazar el registro con un correo duplicado", async () => {
    const respuesta = await request(app)
        .post("/api/auth/registro")
        .send({
            nombre_usuario: "Prueba",
            correo: "postman@roydent.com",
            password: "ClavePrueba123"
        });

    expect(respuesta.statusCode).toBe(409);
    expect(respuesta.body).toHaveProperty("mensaje");
});
test("Debe responder 404 cuando el paciente no existe", async () => {
    const respuesta = await request(app)
        .get("/api/pacientes/documento/9999999999");

    expect(respuesta.statusCode).toBe(404);
    expect(respuesta.body).toHaveProperty("mensaje");
});
});

afterAll(async () => {
    await new Promise((resolve, reject) => {
        conexion.end((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
});
