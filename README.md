# PROGIII-Grupo-AI

Este proyecto es un **backend de reservas de salones** hecho con **Node.js**, **Express**, **Sequelize** y **MySQL**.  
Permite consultar salones disponibles desde un endpoint `/salones`.

---

## 🔹 Tecnologías utilizadas

- Node.js v22
- Express
- Sequelize (ORM para MySQL)
- MySQL / MariaDB
- dotenv (manejo de variables de entorno)
- nodemon (reconstrucción automática del servidor en desarrollo)
- morgan (logs de solicitudes HTTP)

---

## 🔹 Estructura de carpetas

`PROGIII-Grupo-AI/
│
├─ src/
│  ├─ app.js                  # Archivo principal del servidor
│  ├─ database/
│  │   └─ database.js         # Configuración de Sequelize y conexión a MySQL
│  ├─ models/
│  │   └─ Salon.js            # Modelo Sequelize para la tabla 'salones'
│  ├─ controllers/
│  │   └─ Salones/
│  │       └─ getAll.js       # Lógica para obtener todos los salones
│  └─ routes/
│      └─ index.js            # Definición de rutas
│
├─ .env.example               # Ejemplo de archivo de variables de entorno
├─ package.json
└─ README.md
`

---

## 🔹 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (igual que `.env.example`) con tus credenciales de MySQL:

`env
DB_NAME=reservas
DB_USER=root
DB_PASS=12345678
DB_HOST=localhost
DB_DIALECT=mysql
PORT=3006
`

> **Nota:** No subas tu `.env` real al repositorio. Solo `.env.example` con datos genéricos.

---

## 🔹 Instalación

1. Clonar el repositorio:

`bash
git clone https://github.com/tu-usuario/PROGIII-Grupo-AI.git
cd PROGIII-Grupo-AI
`

2. Instalar dependencias:

`bash
npm install
`

3. Crear tu archivo `.env` a partir de `.env.example` y completar con tus datos de MySQL.

4. Importar la base de datos en MySQL con el script `script_reservas.sql`:

`sql
-- Ejecutar en MySQL Workbench o tu cliente favorito
source C:/PROGIII-Grupo-AI/script_reservas.sql;
`

---

## 🔹 Ejecución en desarrollo

`bash
npm run dev
`

- El servidor correrá en `http://localhost:3006`.
- Se imprimirá en consola:

`conexion exitosa
Servidor corriendo en http://localhost:3006
`

- Cada request se verá en consola gracias a **morgan**:

`GET /salones 200 15.123 ms - 512
`

---

## 🔹 Endpoints disponibles

| Método | Ruta     | Descripción                                                |
| ------ | -------- | ---------------------------------------------------------- |
| GET    | /salones | Devuelve todos los salones registrados en la base de datos |

Ejemplo de respuesta:

`json
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
`

---

## 🔹 Notas importantes

- El proyecto **solo tiene el CRUD de lectura** para salones (`GET /salones`).
- Para agregar usuarios, reservas o servicios, se deben crear más endpoints y modelos.
- Nodemon está configurado para **reiniciar el servidor automáticamente** cuando hay cambios en `src/`.
- Morgan logea todos los requests HTTP en consola para facilitar el debugging.

---

## 🔹 Comandos útiles

- Iniciar servidor en desarrollo:

`bash
npm run dev
`

- Instalar dependencias nuevas:

`bash
npm install <nombre-paquete>
`

- Sincronizar tablas desde Sequelize (opcional):

`js
sequelize.sync({ force: true }); ⚠️ Borra datos existentes
`

---

## 🔹 Licencia

MIT License

---

## 🔹 .env.example

`env
DB_NAME=reservas
DB_USER=root
DB_PASS=12345678
DB_HOST=localhost
DB_DIALECT=mysql
PORT=3006
`
