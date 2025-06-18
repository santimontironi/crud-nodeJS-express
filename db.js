require('dotenv').config() //se cargan las variables de entorno
const { Pool } = require('pg')

//conexion a la base de datos PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})

//exportamos la conexion
module.exports = pool