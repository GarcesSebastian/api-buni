import bcrypt from 'bcryptjs';
import { RoleModule } from '../models/roles.module.js';
import { UserModule } from '../models/user.module.js';
import { Utils } from '../lib/Utils.js';
import { EmailManager } from '../lib/EmailManager.js';
import { CodeManager } from '../lib/CodeManager.js';
import type { User } from '../types/domain.js';

type AnyRecord = Record<string, unknown>;

export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await UserModule.getUsers();
    return users;
  } catch (error) {
    console.error('Error en getUsers:', error);
    throw new Error('Error al obtener los usuarios de la base de datos');
  }
};

export const createUser = async (userData: AnyRecord): Promise<AnyRecord> => {
  try {
    const { name, email, password, roles } = userData as {
      name?: string;
      email?: string;
      password?: string;
      roles?: { id: unknown };
    };

    if (!name || !email || !password || !roles) {
      throw new Error('Todos los campos son requeridos');
    }

    const existingEmail = await UserModule.getUserByEmail(email);
    if (existingEmail) {
      throw new Error('El email ya está registrado');
    }

    const existingName = await UserModule.getUserByName(name);
    if (existingName) {
      throw new Error('El nombre ya está registrado');
    }

    if (roles.id == -1) {
      const roles_module = await RoleModule.getRoles();
      const role_selected = roles_module[0];
      roles.id = role_selected?.id;
    }

    const existingRole = await RoleModule.getRoleById(String(roles.id));
    if (!existingRole) {
      throw new Error('El rol especificado no existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const payload = {
      id: Utils.generateUUID(),
      name,
      email,
      password: hashedPassword,
      role_id: roles.id,
    };

    const payloadEmail = {
      to: email,
      templateName: 'createAccount',
      data: {
        nombre: name,
        password: password,
        email: email,
        role: existingRole.name,
      },
    };

    const result = await UserModule.createUser(payload);

    if (result.affectedRows === 0) {
      throw new Error('Error al crear el usuario');
    }

    try {
      const emailManager = new EmailManager();
      await emailManager.sendEmail(payloadEmail);
    } catch (emailError) {
      console.error(
        'Error al enviar el correo, pero el usuario fue creado:',
        (emailError as Error).message,
      );
    }

    const { password: _password, ...user } = payload;

    return {
      ...user,
      roles: {
        id: user.role_id,
        key: 'roles',
      },
    };
  } catch (error) {
    console.error('Error en createUser:', error);
    const message = (error as Error).message;
    if (
      message.includes('requeridos') ||
      message.includes('ya está registrado') ||
      message.includes('no existe')
    ) {
      throw error;
    }

    throw new Error('Error al crear el usuario en la base de datos');
  }
};

export const updateUser = async (id: string, userData: AnyRecord): Promise<boolean> => {
  try {
    const { name, email, roles } = userData as {
      name?: string;
      email?: string;
      roles?: { id: unknown };
    };

    const result = await UserModule.updateUser(id, { name, email, role_id: roles?.id });

    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    return true;
  } catch (error) {
    console.error('Error en updateUser:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('no encontrado')) {
      throw error;
    }
    throw new Error('Error al actualizar el usuario en la base de datos');
  }
};

export const recoveryPassword = async (id: string): Promise<boolean> => {
  try {
    const user = await UserModule.getUserById(id);

    if (!user) {
      throw new Error('El usuario no existe');
    }

    const recoveryCode = CodeManager.generateCode();
    CodeManager.addCode(id, recoveryCode);

    const payloadEmail = {
      to: user.email,
      templateName: 'recoverPassword',
      data: {
        nombre: user.name,
        recoveryCode: recoveryCode,
      },
    };

    const emailManager = new EmailManager();
    const emailSent = await emailManager.sendEmail(payloadEmail);

    if (!emailSent) {
      throw new Error('Error al enviar el correo de recuperación');
    }

    // Secret-leaking log removed (design §3.7): never log recovery codes.

    return true;
  } catch (error) {
    console.error('Error en recoveryPassword:', error);
    throw error;
  }
};

export const verifyRecoveryPassword = async (
  id: string,
  code: number | string,
): Promise<boolean> => {
  try {
    const user = await UserModule.getUserById(id);

    if (!user) {
      throw new Error('El usuario no existe');
    }

    const recoveryCode = CodeManager.getCode(id);

    if (!recoveryCode) {
      throw new Error('El codigo de recuperación no existe');
    }

    const isCodeValid = CodeManager.verifyCode(id, code);

    if (!isCodeValid) {
      throw new Error('El codigo de recuperación no es válido');
    }

    return true;
  } catch (error) {
    console.error('Error en verifyRecoveryPassword:', error);
    throw error;
  }
};

export const changePassword = async (id: string, password: string): Promise<boolean> => {
  try {
    const user = await UserModule.getUserById(id);

    if (!user) {
      throw new Error('El usuario no existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await UserModule.updateUser(id, { password: hashedPassword });

    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    CodeManager.expireCode(id);

    return true;
  } catch (error) {
    console.error('Error en changePassword:', error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    if (!id) {
      throw new Error('El ID del usuario es requerido');
    }

    const result = await UserModule.deleteUser(id);

    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    return true;
  } catch (error) {
    console.error('Error en deleteUser:', error);
    const message = (error as Error).message;
    if (message.includes('requerido') || message.includes('no encontrado')) {
      throw error;
    }
    throw new Error('Error al eliminar el usuario de la base de datos');
  }
};
