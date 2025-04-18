import { pool } from '../database/config.js';

export const CreateCustomRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        if (!name || !permissions) {
            return res.status(400).json({ error: 'Se requieren nombre y permisos' });
        }

        let permissionsJson;
        try {
            permissionsJson = typeof permissions === 'string' 
                ? JSON.parse(permissions) 
                : permissions;
        } catch (error) {
            return res.status(400).json({ error: 'Formato de permisos inválido' });
        }

        if (typeof permissionsJson !== 'object' || permissionsJson === null) {
            return res.status(400).json({ error: 'Los permisos deben ser un objeto' });
        }

        const [result] = await pool.query(
            'INSERT INTO roles (name, permissions) VALUES (?, ?)',
            [name, JSON.stringify(permissionsJson)]
        );

        return res.status(201).json({
            id: result.insertId,
            name,
            permissions: permissionsJson,
            created_at: new Date()
        });
    } catch (error) {
        console.error('Error al crear rol:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const GetCustomRoles = async (req, res) => {
    try {
        const [roles] = await pool.query('SELECT * FROM roles');
        
        const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            permissions: typeof role.permissions === 'string' 
                ? JSON.parse(role.permissions) 
                : role.permissions,
            created_at: role.created_at
        }));

        return res.json(formattedRoles);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const UpdateCustomRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;

        if (!name || !permissions) {
            return res.status(400).json({ error: 'Se requieren nombre y permisos' });
        }

        let permissionsJson;
        try {
            permissionsJson = typeof permissions === 'string' 
                ? JSON.parse(permissions) 
                : permissions;
        } catch (error) {
            return res.status(400).json({ error: 'Formato de permisos inválido' });
        }

        if (typeof permissionsJson !== 'object' || permissionsJson === null) {
            return res.status(400).json({ error: 'Los permisos deben ser un objeto' });
        }

        const [existingRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        if (existingRole.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        const [existingName] = await pool.query(
            'SELECT * FROM roles WHERE name = ? AND id != ?',
            [name, id]
        );
        if (existingName.length > 0) {
            return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
        }

        await pool.query(
            'UPDATE roles SET name = ?, permissions = ? WHERE id = ?',
            [name, JSON.stringify(permissionsJson), id]
        );

        return res.json({
            id: parseInt(id),
            name,
            permissions: permissionsJson,
            created_at: existingRole[0].created_at
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const DeleteCustomRole = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(id)

        const [existingRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        if (existingRole.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        const [usersWithRole] = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
            [existingRole[0].id]
        );

        if (usersWithRole[0].count > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar el rol porque hay usuarios que lo están utilizando' 
            });
        }

        await pool.query('DELETE FROM roles WHERE id = ?', [id]);

        return res.json({ 
            message: 'Rol eliminado exitosamente',
            deletedRole: {
                id: parseInt(id),
                name: existingRole[0].name
            }
        });
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};