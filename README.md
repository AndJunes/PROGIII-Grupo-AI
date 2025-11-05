# Pogramacion 3 - Grupo-AI

Este proyecto es un **backend de gestion de reservas de salones** desarrollado con **Node.js**, **Express** y **MySQL**.  
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
│  │   ├─ database.js         # Conexion a la base de datos
│  │   ├─ ReservasDAO.js      # y Capa de Acceso a Datos
│  │   ├─ SalonesDAO.js
│  │   ├─ ServiciosDAO.js
│  │   ├─ TurnosDAO.js
│  │   └─ UsuariosDAO.js
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
├─ package.json
└─ README.md
```

---

##  Configuracion de la Base de Datos

1.  Crea la base de datos (con usuario adminsitrador). Se recomienda
usar un usuario con permisos de administrador (como root) para crear
la base de datos y las tablas iniciales.

```sql
-- Conéctate como root en MySQL
DROP DATABASE IF EXISTS reservas;
CREATE DATABASE reservas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reservas;

-- Luego ejecuta la creación de tablas e inserción de datos
-- (Podes usar el script completo "script_reservas.sql")
```
> **Nota:** Esto solo se hace una vez. No es recomendable que tu API cree o elimine la base de datos.

2. Crea un usuario dedicado para la API (Un usuario que tu api
usara para leer y escribir datos). Por ejemplo:
```sql
CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';
GRANT SELECT, INSERT, UPDATE, DELETE ON reservas.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;
```
* Este usuario solo puede operar sobre la base reservas.
* No tiene permisos de crear o eliminar bases de datos, ni modificar otras bases.

3. Dar permiso para ejecutar el procedimiento almacenado (manual, después de crear el usuario y crear la base de datos con el script):
```sql
GRANT EXECUTE ON PROCEDURE reservas.reporte_detalle_reservas TO 'api_user'@'localhost';
FLUSH PRIVILEGES;
```
> **Nota:** `api_user` y `localhost` deberia ser cambiado por tu usuario e ip especial correspondientemente para asignar dichos permisos.

4. Configurar tu API para usar el usuario dedicado. Crea un archivo `.env` como este.
```js
DB_NAME=nombre_de_la_base_de_datos
DB_USER=tu_usuario
DB_PASS=tu_contrasenia
DB_HOST=localhost
PORT=3006
JWT_SECRET=tu_palabra_secreta

#correo desde donde se mandan las notificaciones via e-mail
USER=tu_correo_electronico
#esta es la clave de apliacion de google
PASS=tu_clave_de_aplicacion
```
> **Nota:** No subas tu `.env` real al repositorio.

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

3. Configurar variables de entorno. 
- Crear tu archivo `.env` a partir del ejemplo proporcionado en la seccion **Configuracion de la Base de Datos**.
- Completa los datos de **MySQL**, **Correo electronico** y **JWT** segun corresponda.

4. Importar la base de datos
- Abri MySQL Workbench (o tu cliente MySQL de preferencia)
- Conectate como root (solo para crear la base de datos).
- Ejectua el script `script_reservas.sql` ubicado en la raiz del proyecto.
- Dar permiso para ejecutar el procedimiento almacenado.

- > **Nota:** El API **no debe usar root**, sino el usuario `api_user` que creaste.
---

##  Ejecución en desarrollo
Para iniciar el servidor:
```
npm run dev
```

- El servidor correrá en `https://localhost:3006`.
- Se imprimirá en consola:

```
Servidor corriendo en http://localhost:3006
conexion exitosa
```

- Cada request se verá en consola gracias a **morgan**:

```
GET /salones 200 15.123 ms - 512
```
---


##  Endpoints disponibles
Una vez clonado el repositorio, instalado las dependencias y levantado el servidor. Podes probar los endpoints desde la propia documentacion de **Swagger**.

1. Entra a https://localhost:3006/api-docs
- Explora los endpoints y probalos desde la interfaz propia de **Swagger UI**.
---

##  Notas importantes

- El proyecto **contiene BREAD** para salones, reservas, servicios, turnos y usuarios.
- Nodemon está configurado para **reiniciar el servidor automáticamente** cuando hay cambios en `src/`.
- Morgan logea todos los requests HTTP en consola para facilitar el debugging. 
- Esta API esta documentada con **Swagger**.
- Los usuarios existentes en la base de datos tienen su contraseña hasheada en MD5, cuando cualquier usuario procede a
iniciar sesion, su contraseña automaticamente se migra a 60 bytes.
- La contraseña de cualquier usuario es **la palabra que esta detras del signo @ de su nombre de usuario**, por ejemplo:
el usuario Pamela Gomez con su nombre de usuario pamgom@correo.com, su contraseña respectivamente es pamgom. 
- Pueden logearse como Administrador y crear su propio tipo de Usuario, a traves de los endpoints correspondientes.
---

##  Licencia

MIT License **© 2025 – Grupo AI**

Proyecto académico para la materia **Programación III** (UNER).

Integrantes:
* Damián Exequiel Cornejo
* Facundo Alcides Diaz
* Andrea Judith Junes
* Lucas Fermín Nieto
