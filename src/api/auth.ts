import usersData from '../data/users.json';
import type { User, LoginFormData, RegisterFormData, AuthResponse } from '../types';

const users = usersData as User[];

export async function loginUser(formData: LoginFormData): Promise<AuthResponse> {
    const foundUser = users.find(user => user.email === formData.email && user.password === formData.password);

    if(!foundUser){
        throw new Error("Verifica el Correo y la Contraseña");
    }

    const { password, ...safeUser } = foundUser;

    return {
        success: true,
        message: `Bienvenid@, ${foundUser.name}`,
        user: safeUser
    };
}

export async function registerUser(formData: RegisterFormData): Promise<AuthResponse> {
    const existingUser = users.some((user) => user.email === formData.email);

    if(existingUser){
        throw new Error("El correo ya se encuentra registrado");
    }

    return {
        success: true,
        message: "Listo. Ya tienes acceso a TutorMatch con tu cuenta :)",
        user: {
            id: users.length + 1,
            email: formData.email,
            name: formData.name,
            role: formData.role
        },
    };
}