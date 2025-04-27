import { pool } from '../database/config.js';

const getSceneries = async () => {
    try {
        const [result] = await pool.query('SELECT * FROM sceneries');
        return result;
    } catch (error) {
        console.error('Error en getSceneries:', error);
        throw error;
    }
};

const getSceneryById = async (id) => {
    try {
        const [result] = await pool.query('SELECT * FROM sceneries WHERE id = ?', [id]);
        return result[0];
    } catch (error) {
        console.error('Error en getSceneryById:', error);
        throw error;    
    }
};

const createScenery = async (scenery) => {
    try {
        const [result] = await pool.query('INSERT INTO sceneries SET ?', [scenery]);
        return result;
    } catch (error) {
        console.error('Error en createScenery:', error);
        throw error;
    }
};

const updateScenery = async (id, scenery) => {
    try {
        const [result] = await pool.query('UPDATE sceneries SET ? WHERE id = ?', [scenery, id]);
        return result;
    } catch (error) {
        console.error('Error en updateScenery:', error);
        throw error;
    }
};

const deleteScenery = async (id) => {
    try {
        const [result] = await pool.query('DELETE FROM sceneries WHERE id = ?', [id]);
        return result;
    } catch (error) {
        console.error('Error en deleteScenery:', error);
        throw error;
    }
};

const getSceneryByName = async (name) => {
    try {
        const [result] = await pool.query('SELECT * FROM sceneries WHERE name = ?', [name]);
        return result[0];
    } catch (error) {
        console.error('Error en getSceneryByName:', error);
        throw error;
    }
};


export class SceneryModule {
    static getSceneries = getSceneries;
    static getSceneryById = getSceneryById;
    static createScenery = createScenery;
    static updateScenery = updateScenery;
    static deleteScenery = deleteScenery;
    static getSceneryByName = getSceneryByName;
}