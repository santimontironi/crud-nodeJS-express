const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
require('dotenv').config() //se cargan las variables de entorno

const port = 3000

const app = express()

// se configura el motor para las vistas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// middleware para pasar los datos enviados en un formulario a un objeto JavaScript accesible en req.body
app.use(bodyParser.urlencoded({ extended: true }));

// servir archivos estáticos
app.use(express.static('public'));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))

//rutas
const indexRoutes = require('./routes/index');
const libroRoutes = require('./routes/libros');

app.use('/', indexRoutes);
app.use('/', libroRoutes);


app.listen(port,() => {
    console.log(`Servidor corriendo en el puerto: ${port}`);
})