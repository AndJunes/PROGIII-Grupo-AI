const express = require('express');
const morgan = require('morgan');
require('dotenv').config({ path: __dirname + '/../.env' });
const routes = require('./routes/index');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/', routes);


const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PASS: ', process.env.DB_PASS);
});