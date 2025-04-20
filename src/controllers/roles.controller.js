import { getRoles, createRole, updateRole, deleteRole } from '../services/roles.service.js';

export const GetCustomRoles = async (req, res) => {
    try {
        const roles = await getRoles();
        return res.json(roles);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        return res.status(500).json({ error: error.message || 'Error al obtener los roles' });
    }
};

export const CreateCustomRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        if (!name || !permissions) {
            return res.status(400).json({ error: 'Se requieren nombre y permisos' });
        }

        let permissionsJson;
        try {
            permissionsJson = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
        } catch (error) {
            return res.status(400).json({ error: 'Formato de permisos inválido' });
        }

        if (typeof permissionsJson !== 'object' || permissionsJson === null) {
            return res.status(400).json({ error: 'Los permisos deben ser un objeto' });
        }

        const role = await createRole(name, permissionsJson);
        return res.status(201).json(role);
    } catch (error) {
        console.error('Error al crear rol:', error);
        if (error.message.includes('ya existe')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || 'Error al crear el rol' });
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
            permissionsJson = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
        } catch (error) {
            return res.status(400).json({ error: 'Formato de permisos inválido' });
        }

        if (typeof permissionsJson !== 'object' || permissionsJson === null) {
            return res.status(400).json({ error: 'Los permisos deben ser un objeto' });
        }

        const role = await updateRole(id, name, permissionsJson);
        return res.json(role);
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        if (error.message.includes('no encontrado') || error.message.includes('ya existe')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || 'Error al actualizar el rol' });
    }
};

export const DeleteCustomRole = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID del rol es requerido' });
        }

        const result = await deleteRole(id);
        return res.json({ 
            message: 'Rol eliminado exitosamente',
            deletedRole: result
        });
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        if (error.message.includes('no encontrado') || error.message.includes('utilizando')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message || 'Error al eliminar el rol' });
    }
};