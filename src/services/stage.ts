import db from "../db/connection";

interface Stage {
    stage_id: number;
    stage_name: string;
    stage_status: "Pendente" | "Andamento" | "Concluída";
    stage_deadline: string;
    air_id: number;
    air_model: string;
}

interface StageEmployee {
    emp_name: string;
    role_name: string;
}

export class StageService {
    static createStage(
        name: string,
        deadline: string,
        aircraftId: number
    ) {
        const stmt = db.prepare(`
            INSERT INTO stage (stage_name, stage_deadline, stage_status, air_id)
            VALUES (?, ?, 'Pendente', ?)
        `);
        const info = stmt.run(name, deadline, aircraftId);
        console.log(`Etapa criada com ID: ${info.lastInsertRowid}`);
    }

    static listStages() {
        const stages = db.prepare(`
            SELECT s.stage_id, s.stage_name, s.stage_status, s.stage_deadline, a.air_model
            FROM stage s
            JOIN aircraft a ON s.air_id = a.air_id
        `).all() as Stage[];

        if (stages.length === 0) {
            console.log("Nenhuma etapa cadastrada.");
            return;
        }

        stages.forEach(s => {
            console.log(
                `ID: ${s.stage_id} | Nome: ${s.stage_name} | Status: ${s.stage_status} | Aeronave: ${s.air_model} | Prazo: ${s.stage_deadline}`
            );
        });
    }

    static assignEmployeeToStage(empId: number, stageId: number) {
        try {
            db.prepare(`
                INSERT INTO stage_employee (emp_id, stage_id)
                VALUES (?, ?)
            `).run(empId, stageId);
            console.log(`Funcionário ${empId} atribuído à etapa ${stageId}`);
        } catch (e) {
            const err = e as { code?: string; message: string };
            if (err.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
                console.log("Funcionário já está atribuído a esta etapa.");
            } else {
                console.error("Erro:", err.message);
            }
        }
    }

    static getStageEmployees(stageId: number) {
        const employees = db.prepare(`
            SELECT e.emp_id, e.emp_name, r.role_name
            FROM employee e
            JOIN stage_employee se ON e.emp_id = se.emp_id
            JOIN role r ON e.role_id = r.role_id
            WHERE se.stage_id = ?
        `).all(stageId) as { emp_id: number; emp_name: string; role_name: string }[];

        if (employees.length === 0) {
            console.log("Nenhum funcionário atribuído a esta etapa.");
            return [];
        }

        console.log(`\n=== FUNCIONÁRIOS DA ETAPA ${stageId} ===`);
        employees.forEach(e => {
            console.log(`ID: ${e.emp_id} | Nome: ${e.emp_name} | Cargo: ${e.role_name}`);
        });

        return employees;
    }

    static getStageDetails(stageId: number) {
        const stage = db.prepare(`
            SELECT s.*, a.air_model
            FROM stage s
            JOIN aircraft a ON s.air_id = a.air_id
            WHERE s.stage_id = ?
        `).get(stageId) as Stage | undefined;

        if (!stage) {
            console.log("Etapa não encontrada.");
            return;
        }

        console.log("\n=== DETALHES DA ETAPA ===");
        console.log(`ID: ${stage.stage_id}`);
        console.log(`Nome: ${stage.stage_name}`);
        console.log(`Status: ${stage.stage_status}`);
        console.log(`Prazo: ${stage.stage_deadline}`);
        console.log(`Aeronave: ${stage.air_model}`);

        const employees = db.prepare(`
            SELECT e.emp_name, r.role_name
            FROM employee e
            JOIN stage_employee se ON e.emp_id = se.emp_id
            JOIN role r ON e.role_id = r.role_id
            WHERE se.stage_id = ?
        `).all(stageId) as StageEmployee[];

        if (employees.length > 0) {
            console.log("\nFuncionários atribuídos:");
            employees.forEach(e => {
                console.log(`- ${e.emp_name} (${e.role_name})`);
            });
        }
    }

    static updateStageStatus(
        stageId: number,
        newStatus: "Pendente" | "Andamento" | "Concluída"
    ) {
        const stage = db.prepare("SELECT * FROM stage WHERE stage_id = ?").get(stageId) as Stage | undefined;
        if (!stage) {
            console.log("❌ Etapa não encontrada.");
            return;
        }

        const order = ["Pendente", "Andamento", "Concluída"];
        const currentIndex = order.indexOf(stage.stage_status);
        const newIndex = order.indexOf(newStatus);

        if (newIndex === -1) {
            console.log("⚠️ Status inválido informado.");
            return;
        }

        if (newIndex < currentIndex) {
            console.log(`⚠️ Transição inválida: não é possível voltar de "${stage.stage_status}" para "${newStatus}".`);
            return;
        }

        if (newIndex === currentIndex) {
            console.log("ℹ️ A etapa já está com esse status.");
            return;
        }

        db.prepare("UPDATE stage SET stage_status = ? WHERE stage_id = ?").run(newStatus, stageId);

        console.log(`✅ Etapa ${stage.stage_id} atualizada: ${stage.stage_status} → ${newStatus}`);
    }
}