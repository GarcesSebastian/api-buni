import axios from 'axios';
import { pool } from '../database/config.js';

export const GetUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users');
        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const CreateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
        return res.status(201).json({ message: 'User created' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const GetDataIP = async (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        const localTime = new Date().toLocaleString("es-ES", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });

        return res.json({
            ip: ip,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localTime: localTime
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
