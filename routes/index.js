const express = require('express')
const router = express.Router()
const bd = require('../db')
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    res.render('index', { title: 'Lecturama' });
})

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        wrongLogin: null,
        errorLogin: null
    })
})

router.post('/login', async (req, res) => {
    const { user, password } = req.body;
    try {
        const results = await bd.query("SELECT * FROM usuarios WHERE username = $1", [user])

        if (results.rows.length === 0) {
            return res.render('login', {
                title: 'Login',
                wrongLogin: 'Usuario o contraseña incorrectas.',
                errorLogin: null
            })
        }

        const usuario = results.rows[0]

        const matchPassword = await bcrypt.compare(password,usuario.password)

        if(matchPassword){
            req.session.usuario = usuario
            return res.redirect('/inicio')
        } else{
            return res.render('login', {
                title: 'Login',
                wrongLogin: 'Contraseña incorrecta.',
                errorLogin: null
            });
        }

    } catch (error) {
        return res.render('login', {
            title: 'Login',
            wrongLogin: null,
            errorLogin: `Error en el servidor: ${error}`
        })
    }
})

router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Registro',
        wrongUser: null,
        registroCorrecto: null,
        errorRegister: null
    })
})

router.post('/register', async (req, res) => {
    const { nombre, apellido, user, email, password } = req.body;
    try {

        const existingUser = await bd.query("SELECT * FROM usuarios WHERE username = $1 OR email = $2", [user, email])

        if (existingUser.rows.length > 0) {
            return res.render('register', {
                title: 'Registro',
                wrongUser: 'Email o username ya usados. Vuelva a intentarlo.',
                registroCorrecto: null,
                errorRegister: null
            });
        }

        // se hashea la contraseña antes de almacenarla en la base de datos
        const hashedPassword = await bcrypt.hash(password, 10)

        await bd.query("INSERT INTO usuarios (username, nombre, apellido, email, password) VALUES ($1, $2, $3, $4, $5)", [user, nombre, apellido, email, hashedPassword])

        return res.render('register', {
            title: 'Registro',
            wrongUser: null,
            errorRegister: null,
            registroCorrecto: 'Usuario registrado correctamente. Ahora inicie sesión.'
        });
        
    } catch (error) {
        return res.render('register', {
            title: 'Registro',
            errorRegister: error,
            registroCorrecto: null,
            wrongUser: null
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send("Error al cerrar sesión");
        res.redirect('/login');
    })
})

module.exports = router;