const express = require('express');
const router = express.Router();
const bd = require('../db');
const protegerRuta = require('../middlewares/protegerRuta');
const multer = require('multer');

// Configuración del almacenamiento en memoria
const upload = multer({ dest: 'public/uploads/' }) 


router.get('/inicio',protegerRuta,async (req,res) => {
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

router.get('/agregar-libro',protegerRuta,(req,res) => {
    res.render('agregarLibro',{
        title:'Agregar libro',
        libroAgregado: null,
        errorAgregarLibro: null
    })
})

router.post('/agregar-libro',protegerRuta, upload.single('imagen'), async (req,res) => {
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

router.post('/eliminar-libro',async (req,res) => {
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

router.get('/libro/:id',async(req,res) => {
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

router.post('/libro/:id',async(req,res) => {
    const {id} = req.params
    const {titulo,descripcion,autor,genero} = req.body
    try{
        await bd.query("UPDATE libros SET titulo = $1, descripcion = $2, autor = $3, genero = $4 WHERE id = $5",[titulo,descripcion,autor,genero,id])
        res.redirect('/inicio')
    }
    catch(error){
        res.send("No se ha podido editar el libro: ", error)
    }
})