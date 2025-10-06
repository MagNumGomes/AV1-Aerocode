import db from "../db/connection";

interface Employee {
    emp_id: number;
    emp_name: string;
    emp_phone: string;
    emp_email: string;
    emp_password: string;
    role_id: number;
    role_name: string;
    addr_state?: string;
    addr_city?: string;
    addr_neighborhood?: string;
}

interface Address {
    state: string;
    city: string;
    neighborhood: string;
}

export class EmployeeService {
    static createEmployee(
        name: string,
        phone: string,
        email: string,
        password: string,
        roleId: number,
        address: Address
    ) {
        try {
            const stmt = db.prepare(`
                INSERT INTO employee (emp_name, emp_phone, emp_email, emp_password, role_id)
                VALUES (?, ?, ?, ?, ?)
            `);
            const info = stmt.run(name, phone, email, password, roleId);

            const empId = info.lastInsertRowid;

            db.prepare(`
                INSERT INTO employee_address (addr_state, addr_city, addr_neighborhood, emp_id)
                VALUES (?, ?, ?, ?)
            `).run(address.state, address.city, address.neighborhood, empId);

            console.log(`✅ Funcionário criado com ID: ${empId}`);
        } catch (e) {
            console.error("Erro ao criar funcionário:", (e as Error).message);
        }
    }

    static listEmployees() {
        const employees = db.prepare(`
            SELECT e.emp_id, e.emp_name, e.emp_email, r.role_name,
                   a.addr_state, a.addr_city
            FROM employee e
            JOIN role r ON e.role_id = r.role_id
            LEFT JOIN employee_address a ON e.emp_id = a.emp_id
        `).all() as Employee[];

        if (employees.length === 0) {
            console.log("Nenhum funcionário cadastrado.");
            return;
        }

        employees.forEach(e => {
            console.log(
                `ID: ${e.emp_id} | Nome: ${e.emp_name} | Cargo: ${e.role_name} | Email: ${e.emp_email} | Cidade: ${e.addr_city || "N/A"}`
            );
        });
    }

    static getEmployeeById(empId: number) {
        const emp = db.prepare(`
            SELECT e.*, r.role_name, a.addr_state, a.addr_city, a.addr_neighborhood
            FROM employee e
            JOIN role r ON e.role_id = r.role_id
            LEFT JOIN employee_address a ON e.emp_id = a.emp_id
            WHERE e.emp_id = ?
        `).get(empId) as Employee | undefined;

        if (!emp) {
            console.log("Funcionário não encontrado.");
            return null;
        }

        console.log("\n=== DETALHES DO FUNCIONÁRIO ===");
        console.log(`ID: ${emp.emp_id}`);
        console.log(`Nome: ${emp.emp_name}`);
        console.log(`Email: ${emp.emp_email}`);
        console.log(`Telefone: ${emp.emp_phone}`);
        console.log(`Cargo: ${emp.role_name}`);
        console.log(`Endereço: ${emp.addr_neighborhood || "N/A"}, ${emp.addr_city || "N/A"} - ${emp.addr_state || "N/A"}`);

        return emp;
    }
}