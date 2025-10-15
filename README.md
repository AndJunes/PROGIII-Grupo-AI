# Pogramacion 3 - Grupo-AI

Este proyecto es un **backend de gestion de reservas de salones** desarrollado con **Node.js**, **Express**, **Sequelize** y **MySQL**.  
Incluye manejo de usuarios, roles, autenticación, notificaciones y reservas.

Permite consultar salones disponibles desde un endpoint `/salones`, `/servicios`,`/turnos`,`/usuarios`, `/reservas`.

---

##  Tecnologías principales

- Node.js v22
- Express (framework para la API REST)
- MySQL
- dotenv (manejo de variables de entorno)
- nodemon (reconstrucción automática del servidor en desarrollo)
- morgan (logs de solicitudes HTTP)
- jsonwebtoken (autenticacion por tokens JWT)
- bcryptjs (encriptacion de contraseñas)
- nodemailer (envio de notificaciones por correo electronico)
- mysql2

---

##  Estructura de carpetas

```
PROGIII-Grupo-AI/
│
├─ src/
│  ├─ app.js                  # Archivo principal del servidor
│  ├─ database/
│  │   └─ database.js         # Configuración de Sequelize y conexión a MySQL
│  │                 
│  ├─ controllers/           # Controladores para diferentes entidades
│  │   ├─ Salones/
│  │   │   ├─ SalonesController.js
│  │   ├─ Usuarios/
│  │   │   ├─ UsuariosController.js
│  │   ├─ Reservas/
│  │   │   ├─ ReservasController.js
│  │   ├─ Servicios/
│  │   │   └─ ServiciosController.js
│  │   └─ Turnos/
│  │       └─ TurnosController.js
│  ├─ AuthController.js
│  ├─ middlewares/
│  │   ├─ auth.js
│  │   └─ roleCheck.js
│  ├─ utils/
│  │   ├─ plantilla.hbs
│  ├─ notificacion/
│  │   ├─ mailer.js
│  └─ routes/
│  │   ├─ index.js
│  │   ├─ salones.js
│  │   ├─ usuarios.js
│  │   ├─ reservas.js
│  │   ├─ servicios.js
│  │   ├─ turnos.js
│  │   ├─ auth.js
│  ├─ services/
│  │   ├─ AuthService.js
│  │   ├─ ReservaService.js
│  │   ├─ SalonesService.js
│  │   ├─ ServiciosService.js
│  │   ├─ TurnosService.js
│  │   ├─ UsuariosService.js
├─ script_reservas.sql
├─ .env.example
├─ package.json
└─ README.md

```

---

##  Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (igual que `.env.example`) con tus credenciales de MySQL:

```
DB_NAME=reservas
DB_USER=root
DB_PASS=12345678
DB_HOST=localhost
DB_DIALECT=mysql
PORT=3006
JWT_SECRET=clave_secreta_super_segura
USER=notificacion.trabajofinal@gmail.com
PASS=clave_app_google
ADMIN_CORREO=micorreo@gmail.com
```

> **Nota:** No subas tu `.env` real al repositorio. Solo `.env.example` con datos genéricos.

---

##  Instalación

1. Clonar el repositorio:

`
git clone https://github.com/tu-usuario/PROGIII-Grupo-AI.git
cd PROGIII-Grupo-AI
`

2. Instalar dependencias:

`
npm install
`

3. Crear tu archivo `.env` a partir de `.env.example` y completar con tus datos de MySQL.

4. Importar la base de datos en MySQL con el script `script_reservas.sql`:

`
Ejecutar en MySQL Workbench o tu cliente favorito: C:/PROGIII-Grupo-AI/script_reservas.sql;
`

---

##  Ejecución en desarrollo

``
npm run dev
``

- El servidor correrá en `https://localhost:3006`.
- Se imprimirá en consola:

```
Servidor corriendo en http://localhost:3006
conexion exitosa
```

- Cada request se verá en consola gracias a **morgan**:

`
GET /salones 200 15.123 ms - 512
`

---
##  Endpoints disponibles

| Método     | Ruta                             | Descripción                                                        |
|------------|----------------------------------|--------------------------------------------------------------------|
| **GET**    | `/salones`                       | Devuelve todos los salones registrados en la base de datos         |
| **GET**    | `/salones/:id`                   | Devuelve la información de un salón específico                     |
| **POST**   | `/salones`                       | Crea un nuevo salón                                                |
| **PUT**    | `/salones/:id`                   | Actualiza los datos de un salón existente                          |
| **DELETE** | `/salones/:id`                   | Elimina (o desactiva) un salón existente                           |
| **GET**    | `/usuarios`                      | Devuelve todos los usuarios registrados                            |
| **GET**    | `/usuarios/:id`                  | Devuelve los datos de un usuario específico                        |
| **GET**    | `/usuarios/clientes`             | Devuelve los datos de solo los CLIENTES                            |
| **POST**   | `/usuarios`                      | Crea un nuevo usuario                                              |
| **POST**   | `/auth/login`                    | Inicia sesión y devuelve token                                     |
| **PUT**    | `/usuarios/:id`                  | Actualiza los datos de un usuario existente                        |
| **DELETE** | `/usuarios/:id`                  | Elimina (soft delete) un usuario existente                         |
| **GET**    | `/reservas`                      | Devuelve todas las reservas (solo para admin o empleado)           |
| **GET**    | `/reservas/:id`                  | Devuelve una reserva específica                                    |
| **GET**    | `/reservas/usuario?propias=true` | Devuelve las reservas de un usuario específico del usuario logeado |
| **POST**   | `/reservas`                      | Crea una nueva reserva para un cliente                             |
| **PUT**    | `/reservas/:id`                  | Actualiza una reserva existente (fecha, estado, etc.)              |
| **DELETE** | `/reservas/:id`                  | Elimina una reserva existente                                      |
| **GET**    | `/servicios`                     | Devuelve todos los servicios disponibles                           |
| **GET**    | `/servicios/:id`                 | Devuelve los detalles de un servicio específico                    |
| **GET**    | `/servicios?propios?true`        | Devuelve los detalles de los servicios del usuario logeado         |
| **POST**   | `/servicios`                     | Crea un nuevo servicio                                             |
| **PUT**    | `/servicios/:id`                 | Actualiza los datos de un servicio existente                       |
| **DELETE** | `/servicios/:id`                 | Elimina un servicio                                                |
| **GET**    | `/turnos`                        | Devuelve todos los turnos disponibles                              |
| **GET**    | `/turnos/:id`                    | Devuelve un turno específico                                       |
| **POST**   | `/turnos`                        | Crea un nuevo turno                                                |
| **PUT**    | `/turnos/:id`                    | Actualiza un turno existente                                       |
| **DELETE** | `/turnos/:id`                    | Elimina un turno existente                                         |



Ejemplo de respuesta (para salones):

```
[
  {
    "salon_id": 1,
    "titulo": "Principal",
    "direccion": "San Lorenzo 1000",
    "latitud": null,
    "longitud": null,
    "capacidad": 200,
    "importe": 95000.00,
    "activo": 1,
    "creado": "2025-08-19T21:51:22.000Z",
    "modificado": "2025-08-19T21:51:22.000Z"
  },
  ...
]
```

---

##  Notas importantes

- El proyecto **contiene BREAD** para salones, reservas, servicios, turnos y usuarios.
- Nodemon está configurado para **reiniciar el servidor automáticamente** cuando hay cambios en `src/`.
- Morgan logea todos los requests HTTP en consola para facilitar el debugging. 
- Documentar la API utilizando **Swagger**.

---

##  Comandos útiles

- Iniciar servidor en desarrollo:

`
npm run dev
`

- Instalar dependencias nuevas:

`
npm install
`

---

##  Licencia

MIT License **© 2025 – Grupo AI**

Proyecto académico para la materia **Programación III** (UNER).

Integrantes:
* Damián Exequiel Cornejo
* Facundo Alcides Diaz
* Andrea Judith Junes
* Lucas Fermín Nieto
