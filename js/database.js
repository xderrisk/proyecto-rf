const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const sqlSchema = `
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    imagen BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS admi (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registro (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    foto BYTEA NOT NULL,
    fecha_hora TIMESTAMP NOT NULL
);
`;

pool.query(sqlSchema)
    .then(() => console.log('Tablas verificadas correctamente.'))
    .catch((err) => console.error('Error ejecutando SQL:', err));

module.exports = pool;
