const express = require('express');
const router = express.Router();
const bd = require('../db');

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
        const results = await bd.query("SELECT * FROM usuarios WHERE username = $1 AND password = $2", [user, password]);
        if (results.rows.length > 0) {
            req.session.usuario = results.rows[0];
            res.redirect('/inicio');
        } else {
            res.render('login', {
                title: 'Login',
                wrongLogin: 'Usuario o contraseña incorrectas.',
                errorLogin: null
            });
        }
    } catch (error) {
        res.render('login', {
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
        const existingUser = await bd.query("SELECT * FROM usuarios WHERE username = $1 OR email = $2", [user, email]);
        if (existingUser.rows.length > 0) {
            return res.render('register', {
                title: 'Registro',
                wrongUser: 'Email o username ya usados. Vuelva a intentarlo.',
                registroCorrecto: null,
                errorRegister: null
            });
        }

        await bd.query("INSERT INTO usuarios (username, nombre, apellido, email, password) VALUES ($1, $2, $3, $4, $5)", [user, nombre, apellido, email, password]);

        res.render('register', {
            title: 'Registro',
            wrongUser: null,
            errorRegister: null,
            registroCorrecto: 'Usuario registrado correctamente. Ahora inicie sesión.'
        });
    } catch (error) {
        res.render('register', {
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