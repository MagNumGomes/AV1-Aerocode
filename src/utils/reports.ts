import db from "../db/connection";
import * as fs from "fs";
import * as path from "path";

interface StageReport {
    stage_id: number;
    stage_name: string;
    stage_status: "Pendente" | "Andamento" | "Concluída";
    stage_deadline: string;
    air_model: string;
    air_type: "Comercial" | "Militar";
}

interface Employee {
    emp_name: string;
}

interface Test {
    test_type: string;
    test_approved: 0 | 1;
}

interface Part {
    part_name: string;
    part_supplier: string;
    part_type: "Nacional" | "Importada";
}

export class ReportService {
    static generateReportForCompletedStage(stageId: number) {
        const stage = db.prepare(`
            SELECT s.*, a.air_model, a.air_type
            FROM stage s
            JOIN aircraft a ON s.air_id = a.air_id
            WHERE s.stage_id = ? AND s.stage_status = 'Concluída'
        `).get(stageId) as StageReport | undefined;

        if (!stage) {
            console.log("Etapa não encontrada ou não está concluída.");
            return;
        }

        const employee = db.prepare(`
            SELECT emp_name
            FROM employee e
            JOIN stage_employee se ON e.emp_id = se.emp_id
            WHERE se.stage_id = ?
            LIMIT 1
        `).get(stageId) as Employee | undefined;

        const tests = db.prepare(`
            SELECT test_type, test_approved
            FROM test
            WHERE stage_id = ?
        `).all(stageId) as Test[];

        const partsUsed = db.prepare(`
            SELECT p.part_name, p.part_supplier, p.part_type
            FROM stage_part sp
            JOIN part p ON sp.part_id = p.part_id
            WHERE sp.stage_id = ?
        `).all(stageId) as Part[];

        const reportPath = path.join(process.cwd(), `relatorio_etapa_${stageId}.txt`);
        let content = `RELATÓRIO DE CONCLUSÃO DE ETAPA\n`;
        content += `==============================\n\n`;
        content += `Aeronave: ${stage.air_model} (${stage.air_type})\n`;
        content += `Cliente: ${employee?.emp_name || "Não especificado"}\n`;
        content += `Data de entrega estimada: ${stage.stage_deadline}\n\n`;

        content += `Etapas realizadas:\n`;
        content += `- ${stage.stage_name} (Concluída em ${new Date().toLocaleDateString()})\n\n`;

        content += `Peças utilizadas:\n`;
        if (partsUsed.length > 0) {
            partsUsed.forEach((p) => {
                content += `- ${p.part_name} (Fornecedor: ${p.part_supplier})\n`;
            });
        } else {
            content += "- Nenhuma peça registrada nesta etapa\n";
        }

        content += `\nResultados dos testes:\n`;
        if (tests.length > 0) {
            tests.forEach((t) => {
                const result = t.test_approved ? "Aprovado" : "Reprovado";
                content += `- ${t.test_type}: ${result}\n`;
            });
        } else {
            content += "- Nenhum teste registrado\n";
        }

        fs.writeFileSync(reportPath, content);
        console.log(`Relatório salvo em: ${reportPath}`);
    }
}