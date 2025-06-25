const bodyParser = require('body-parser')
const bd = require('./db')
const express = require('express')
const session = require('express-session')
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
    secret: 'lecturama_secreta', // poné un valor seguro
    resave: false,
    saveUninitialized: false
}))

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
            res.redirect('/libros')
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

function protegerRuta(req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/login')
    }
}

app.get('/libros',protegerRuta,async (req,res) => {
    try{
        const results = await bd.query("SELECT * FROM libros")
        res.render('libros',{libros:results.rows})
    }
    catch(error){
        res.status(500).send(`Error al obtener libros : ${error}`)
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