const bodyParser = require('body-parser')
const pool = require('./db')
const express = require('express')
const port = 3000

const app = express()

// se configura el motor para las vistas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// middleware para pasar los datos enviados en un formulario a un objeto JavaScript accesible en req.body
app.use(bodyParser.urlencoded({ extended: true }));

// servir archivos estáticos
app.use(express.static('public'));

app.get('/',async (req,res) => {
    try{
        const results = await pool.query("SELECT * FROM libros")
        res.render('index',{libros:results.rows})
    }
    catch(error){
        console.error('Error al obtener libros:', error)
        res.status(500).send('Error al obtener libros')
    }
})

app.listen(port,() => {
    console.log(`Servidor corriendo en el puerto: ${port}`);
})