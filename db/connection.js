import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

client.connect();

export default client;
