import { pool } from '../database/config.js';

export const deleteEvents = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM events');
        res.status(200).json({ 
            message: 'Eventos eliminados correctamente',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Error en deleteEvents:', error);
        res.status(500).json({ 
            error: 'Error al eliminar los eventos',
            details: error.message
        });
    }
};

export const deleteForms = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM forms');
        res.status(200).json({ 
            message: 'Formularios eliminados correctamente',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Error en deleteForms:', error);
        res.status(500).json({ 
            error: 'Error al eliminar los formularios',
            details: error.message
        });
    }
};

export const deleteUsers = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM users');
        res.status(200).json({ 
            message: 'Usuarios eliminados correctamente',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Error en deleteUsers:', error);
        res.status(500).json({ 
            error: 'Error al eliminar los usuarios',
            details: error.message
        });
    }
};

export const deleteRoles = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM roles');
        res.status(200).json({ 
            message: 'Roles eliminados correctamente',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Error en deleteRoles:', error);
        res.status(500).json({ 
            error: 'Error al eliminar los roles',
            details: error.message
        });
    }
};

export const deleteScenery = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM scenery');
        res.status(200).json({ 
            message: 'Escenarios eliminados correctamente',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Error en deleteScenery:', error);
        res.status(500).json({ 
            error: 'Error al eliminar los escenarios',
            details: error.message
        });
    }
};

export const deletePrograms = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM programs');
        res.status(200).json({ 
            message: 'Programas eliminados correctamente',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Error en deletePrograms:', error);
        res.status(500).json({ 
            error: 'Error al eliminar los programas',
            details: error.message
        });
    }
};

export const deleteAll = async (req, res) => {
    try {
        const results = await Promise.all([
            pool.query('DELETE FROM events'),
            pool.query('DELETE FROM forms'),
            pool.query('DELETE FROM users'),
            pool.query('DELETE FROM roles'),
            pool.query('DELETE FROM scenery'),
            pool.query('DELETE FROM programs')
        ]);

        const summary = {
            events: results[0][0].affectedRows,
            forms: results[1][0].affectedRows,
            users: results[2][0].affectedRows,
            roles: results[3][0].affectedRows,
            scenery: results[4][0].affectedRows,
            programs: results[5][0].affectedRows
        };

        res.status(200).json({ 
            message: 'Todos los datos eliminados correctamente',
            summary
        });
    } catch (error) {
        console.error('Error en deleteAll:', error);
        res.status(500).json({ 
            error: 'Error al eliminar los datos',
            details: error.message
        });
    }
};