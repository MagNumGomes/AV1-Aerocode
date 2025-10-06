import db from "../db/connection";
import inquirer from "inquirer";

export interface AuthenticatedUser {
    emp_id: number;
    emp_name: string;
    role_name: "Admin" | "Gerente" | "Técnico";
}

// Mapeamento de permissões por papel
const permissions = {
    Admin: ["*"], // Acesso total
    Gerente: [
        "aircraft:create", "aircraft:read", "aircraft:update",
        "part:create", "part:read", "part:update", "part:assign",
        "stage:create", "stage:read", "stage:update", "stage:assign",
        "test:create", "test:read", "test:update",
        "report:generate"
    ],
    Técnico: [
        "aircraft:read",
        "part:read", "part:updateStatus",
        "stage:read", "stage:update",
        "test:read", "test:update"
    ]
};

/**
 * Verifica se um usuário tem a permissão necessária.
 * @param user O usuário autenticado.
 * @param requiredPermission A permissão necessária (ex: 'aircraft:create').
 */
export function hasPermission(user: AuthenticatedUser, requiredPermission: string): boolean {
    const userPermissions = permissions[user.role_name];
    if (!userPermissions) {
        return false; // Papel sem permissões definidas
    }

    // Admin tem acesso a tudo
    if (userPermissions.includes("*")) {
        return true;
    }

    // Verifica se a permissão exata ou uma permissão genérica (ex: 'aircraft:read') existe
    const [entity, action] = requiredPermission.split(':');
    return userPermissions.includes(requiredPermission) || userPermissions.includes(`${entity}:read`) || userPermissions.includes(`${entity}:update`);
}


export class AuthService {
    static async login(): Promise<AuthenticatedUser | null> {
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "email",
                message: "Email:"
            },
            {
                type: "password",
                name: "password",
                message: "Senha:",
                mask: "*"
            }
        ]);

        const { email, password } = answers;

        const user = db
            .prepare(`
                SELECT e.emp_id, e.emp_name, r.role_name
                FROM employee e
                JOIN role r ON e.role_id = r.role_id
                WHERE e.emp_email = ? AND e.emp_password = ?
            `)
            .get(email, password) as AuthenticatedUser | undefined;

        if (!user) {
            console.log("Credenciais inválidas.");
            return null;
        }

        console.log(`Bem-vindo, ${user.emp_name} (${user.role_name})!`);
        return user;
    }
}