const bodyParser = require('body-parser')
const bd = require('./db')
const express = require('express')
const session = require('express-session')
const multer = require('multer')
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

// Configuración del almacenamiento en memoria
const upload = multer({ dest: 'public/uploads/' }) 

function protegerRuta(req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/login')
    }
}

app.get('/',(req,res) => {
    res.render('index',{
        title: 'Lecturama'
    })
})

app.get('/login',(req,res) => {
    res.render('login',{
        title: 'Login',
        wrongLogin: null,
        errorLogin: null
    })
})

app.post('/login', async (req,res) => {
    const {user,password} = req.body
    try{
        const results = await bd.query("SELECT * FROM usuarios WHERE username = $1 AND password = $2",[user,password])
        if(results.rows.length > 0){
            req.session.usuario = results.rows[0]
            res.redirect('/inicio')
        }
        else{
            res.render('login',{
                title: 'Login',
                wrongLogin:'Usuario o contraseña incorrectas.',
                errorLogin: null
            })
        }
    }
    catch(error){
        res.render('login',{
            title: 'Login',
            wrongLogin: null,
            errorLogin: `Error en el servidor: ${error}`
        })
    }
})

app.get('/register',(req,res) => {
    res.render('register',{
        title:'Registro',
        wrongUser: null,
        registroCorrecto: null,
        errorRegister: null
    })
})

app.post('/register',async (req,res) => {
    const {nombre,apellido,user,email,password} = req.body
    try{
        const existingUser = await bd.query("SELECT * FROM usuarios WHERE username = $1 OR email = $2",[user,email])

        if(existingUser.rows.length > 0){
            return res.render('register',{
                title: 'Registro',
                wrongUser: 'Email o username ya usados. Vuelva a intentarlo.',
                registroCorrecto: null,
                errorRegister: null
            })
        }

        await bd.query("INSERT INTO usuarios (username,nombre,apellido,email,password) VALUES ($1,$2,$3,$4,$5)",[user,nombre,apellido,email,password])

        res.render('register',{
            title:'Registro',
            wrongUser: null,
            errorRegister: null,
            registroCorrecto: 'Usuario registrado correctamente. Ahora inicie sesión.'
        })
    }
    catch(error){
        res.render('register',{
            title: 'Registro',
            errorRegister: error,
            registroCorrecto: null,
            wrongUser: null
        })
    }
})

app.get('/inicio',protegerRuta,async (req,res) => {
    const usuarioLogueado = req.session.usuario.id
    try{
        const results = await bd.query("SELECT * FROM libros WHERE usuario_id = $1",[usuarioLogueado])
        res.render('inicio',{
            title:'Inicio',
            libros:results.rows
        })
    }
    catch(error){
        res.status(500).send(`Error al obtener libros : ${error}`)
    }
})

app.get('/agregar-libro',protegerRuta,(req,res) => {
    res.render('agregarLibro',{
        title:'Agregar libro',
        libroAgregado: null,
        errorAgregarLibro: null
    })
})

app.post('/agregar-libro',protegerRuta, upload.single('imagen'), async (req,res) => {
    const{titulo,descripcion,genero,autor,anio} = req.body
    const usuarioLogueado = req.session.usuario.id
    const imagenPath = req.file ? `/uploads/${req.file.filename}` : null // ruta pública
    try{
        await bd.query("INSERT INTO libros (imagen,titulo,descripcion,genero,autor,anio,usuario_id) VALUES ($1,$2,$3,$4,$5,$6,$7)",
            [imagenPath,titulo,descripcion,genero,autor,anio,usuarioLogueado]
        )
        res.redirect('/inicio')
    }
    catch(error){
        res.render('agregarLibro',{
            title:'Agregar libro',
            libroAgregado: null,
            errorAgregarLibro: `Hubo un error al agregar el libro: ${error}`
        })
    }
})

app.post('/eliminar-libro',async (req,res) => {
    const {idLibro} = req.body
    try{
        await bd.query("DELETE FROM libros WHERE id = $1",[idLibro])
        res.redirect('/inicio')
    }
    catch(error){
        res.send("HUBO UN ERROR: ",error)
        console.log(`error al eliminar: ${error}`)
    }   
})

app.get('/libro/:id',async(req,res) => {
    const {id} = req.params
    try {
        const libro = await bd.query("SELECT * FROM libros WHERE id = $1",[id])
        const libroObtenido = libro.rows
        res.render('libro',{
            title: 'Libro',
            libro: libroObtenido[0],
            errorAgregarLibro: null
        })
    } catch (error) {
        res.render('libro',{
            title: 'Libro',
            libro: null,
            errorObtenerLibro: 'No se ha podido obtener la información del libro.'
        })
    }
})

app.post('/libro/:id',async(req,res) => {
    const {id} = req.params
    const {titulo,descripcion,autor,genero} = req.body
    try{
        await bd.query("UPDATE libros SET titulo = $1, descripcion = $2, autor = $3, genero = $4 WHERE id = $5",[titulo,descripcion,autor,genero,id])
        res.redirect('/inicio')
    }
    catch(error){

    }
})

app.get('/logout',(req,res) => {
    req.session.destroy(err => {
        if(err){
            return res.send("Error al cerrar sesión")
        }
        res.redirect('/login')
    })
})

app.listen(port,() => {
    console.log(`Servidor corriendo en el puerto: ${port}`);
})