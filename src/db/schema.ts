import db from "./connection"

db.exec(`
    CREATE TABLE IF NOT EXISTS aircraft (
        air_id INTEGER PRIMARY KEY AUTOINCREMENT,
        air_model VARCHAR(255) NOT NULL,
        air_type TEXT CHECK(air_type IN ('Comercial', 'Militar')) NOT NULL,
        air_capacity DECIMAL(10, 2) NOT NULL,
        air_reach DECIMAL(10, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS part (
        part_id INTEGER PRIMARY KEY AUTOINCREMENT,
        part_name VARCHAR(255) NOT NULL,
        part_type TEXT CHECK(part_type IN ('Nacional', 'Importada')) NOT NULL,
        part_supplier VARCHAR(255) NOT NULL,
        part_status TEXT CHECK(part_status IN ('Em produção', 'Em transporte', 'Pronta para uso')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS part_status (
        ps_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ps_status TEXT CHECK(ps_status IN ('Em produção', 'Em transporte', 'Pronta para uso')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        part_id INT NOT NULL,
        FOREIGN KEY (part_id) REFERENCES part(part_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stage (
        stage_id INTEGER PRIMARY KEY AUTOINCREMENT,
        stage_name VARCHAR(255) NOT NULL,
        stage_deadline DATETIME NOT NULL,
        stage_status TEXT CHECK(stage_status IN ('Pendente', 'Andamento', 'Concluída')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        air_id INT NOT NULL,
        FOREIGN KEY (air_id) REFERENCES aircraft(air_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS role (
        role_id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_name VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS employee (
        emp_id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_name VARCHAR(255) NOT NULL,
        emp_phone VARCHAR(55) NOT NULL,
        emp_email VARCHAR(255) NOT NULL UNIQUE,
        emp_password VARCHAR(255) NOT NULL,
        
        role_id INT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES role(role_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS employee_address (
        addr_id INTEGER PRIMARY KEY AUTOINCREMENT,
        addr_state VARCHAR(2) NOT NULL,
        addr_city VARCHAR(255) NOT NULL,
        addr_neighborhood VARCHAR(255) NOT NULL,
        
        emp_id INT NOT NULL,
        FOREIGN KEY (emp_id) REFERENCES employee(emp_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stage_employee (
        emp_id INT NOT NULL,
        stage_id INT NOT NULL,

        PRIMARY KEY (emp_id, stage_id),

        FOREIGN KEY (emp_id) REFERENCES employee(emp_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        FOREIGN KEY (stage_id) REFERENCES stage(stage_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stage_part (
        stage_id INT,
        part_id INT,
        PRIMARY KEY (stage_id, part_id),
        FOREIGN KEY (stage_id) REFERENCES stage(stage_id) ON DELETE CASCADE,
        FOREIGN KEY (part_id) REFERENCES part(part_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test (
        test_id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_type TEXT CHECK(test_type IN ('Elétrico', 'Hidráulico', 'Aerodinâmico')) NOT NULL,
        test_approved INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        stage_id INT NOT NULL,
        FOREIGN KEY (stage_id) REFERENCES stage(stage_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
    );
`)

const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Técnico' },
    { id: 3, name: 'Gerente' }
]

for (const role of roles) {
    db.prepare(`
        INSERT OR IGNORE INTO role (role_id, role_name)
        VALUES (?, ?)    
    `).run(role.id, role.name)
}

const adminEmail = "admin@aerocode.com"
const adminExists = db.prepare("SELECT 1 FROM employee WHERE emp_email = ?").get(adminEmail)

if (!adminExists) {
    db.prepare(`
        INSERT INTO employee (emp_name, emp_phone, emp_email, emp_password, role_id)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        "Administrador do Sistema",
        "+55 00 00000-0000",
        adminEmail,
        "admin123",
        1
    )

    const adminId = (db.prepare("SELECT last_insert_rowid() AS id").get() as { id: number }).id

    db.prepare(`
        INSERT INTO employee_address (addr_state, addr_city, addr_neighborhood, emp_id)
        VALUES (?, ?, ?, ?)
    `).run("SP", "São Paulo", "Centro", adminId)

    console.log("Usuário admin criado:")
    console.log("Email: admin@aerocode.com")
    console.log("Senha: admin123")
}

console.log('Banco de dados inicializado com sucesso')