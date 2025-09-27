import express from "express";
import Handlebars from "handlebars";
import nodemailer from "nodemailer";
import {fileURLToPath} from "url";
import { readFile } from "fs/promises";
import path from "path";

// instancia express
const app = express();

// las solicitus con un body las interpretamos como JSON
app.use(express.json());

// ruta del estado de api, sería como ver si esta activa la aplicación
app.get('/estado', (req, res) => {
    res.json({'ok':true});    
})

// ruta tipo POST, por ahora recibe datos, la completaremos con el envio de un correo electrónico
app.post('/notificacion', async (req, res) => {

    if(!req.body.fecha ||  !req.body.salon || !req.body.turno || !req.body.correoDestino){
        res.status(400).send({'estado':false, 'mensaje':'Faltan datos requeridos!'});
    }
    
    try{
        const __filename= fileURLToPath(import.meta.url);
        const __dirname=path.dirname(__filename);

        const plantilla = path.join(__dirname, "utils", "plantilla.hbs");
        console.log(plantilla);

    }catch(error){
        console.log(error);
    }
})