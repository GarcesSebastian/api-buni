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
