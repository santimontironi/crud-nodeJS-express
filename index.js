const bodyParser = require('body-parser')
const bd = require('./db')
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

app.get('/',(req,res) => {
    res.render('index',{
        title: 'Lecturama'
    })
})

app.get('/login',(req,res) => {
    res.render('login',{
        title: 'Login'
    })
})

app.post('/login', async (req,res) => {
    const {user,password} = req.body
    try{
        const results = await bd.query("SELECT * FROM usuarios WHERE username = $1 AND password = $2",[user,password])
        if(results.rows.length > 0){
            res.redirect('/libros')
        }
        else{
            res.status(404).send('Usuario o contraseña incorrectas.')
        }
    }
    catch(error){
        res.status(500).send(`Error en el servidor: ${error}`)
    }
})

app.get('/register',(req,res) => {
    res.render('register',{
        title:'Registro'
    })
})

app.post('/register',async (req,res) => {
    const {nombre,apellido,user,email,password} = req.body
    try{
        const existingUser = await bd.query("SELECT * FROM usuarios WHERE username = $1 AND email = $2",[user,email])

        if(existingUser.rows.length > 0){
            res.render('register',{
                wrongUser: 'Email o username ya usados. Vuelva a intentarlo.'
            })
        }

        await bd.query("INSERT INTO usuarios (username,nombre,apellido,email,password) VALUES ($1,$2,$3,$4,$5)",[user,nombre,apellido,email,password])

        res.send('Usuario registrado correctamente')
    }
    catch(error){
        res.render('register',{
            errorRegister: error
        })
    }
})

app.get('/libros',async (req,res) => {
    try{
        const results = await bd.query("SELECT * FROM libros")
        res.render('libros',{libros:results.rows})
    }
    catch(error){
        res.status(500).send(`Error al obtener libros : ${error}`)
    }
})

app.listen(port,() => {
    console.log(`Servidor corriendo en el puerto: ${port}`);
})