const bodyParser = require('body-parser')
const pool = require('./db')
const app = require('express')
const port = 3000

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
        console.error('Error al obtener libros:', err)
        res.status(500).send('Error al obtener libros')
    }
})

app.listen(() => {
    console.log(`Servidor corriendo en el puerto: ${port}`);
})