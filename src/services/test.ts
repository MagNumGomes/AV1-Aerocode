import db from "../db/connection";

export class TestService {
    static createTest(stageId: number, testType: "Elétrico" | "Hidráulico" | "Aerodinâmico") {
        const stmt = db.prepare(`
            INSERT INTO test (test_type, test_approved, stage_id)
            VALUES (?, 0, ?)
        `);
        const info = stmt.run(testType, stageId);
        console.log(`Teste criado com ID: ${info.lastInsertRowid} (não aprovado por padrão)`);
    }

    static approveTest(testId: number) {
        const stmt = db.prepare("UPDATE test SET test_approved = 1 WHERE test_id = ?");
        const info = stmt.run(testId);
        if (info.changes === 0) {
            console.log("Teste não encontrado.");
            return;
        }
        console.log(`Teste ${testId} aprovado!`);
    }

    static listTestsByStage(stageId: number) {
        const tests = db.prepare(`
            SELECT test_id, test_type, test_approved, created_at
            FROM test
            WHERE stage_id = ?
        `).all(stageId);

        if (tests.length === 0) {
            console.log("Nenhum teste registrado para esta etapa.");
            return;
        }

        console.log(`\n=== TESTES DA ETAPA ${stageId} ===`);
        tests.forEach((t: any) => {
            const status = t.test_approved ? "Aprovado" : "Pendente";
            console.log(`ID: ${t.test_id} | Tipo: ${t.test_type} | Status: ${status} | Criado em: ${t.created_at}`);
        });
    }

    static rejectTest(testId: number) {
        const test = db.prepare("SELECT * FROM test WHERE test_id = ?").get(testId);
        if (!test) {
            console.log("❌ Teste não encontrado.");
            return;
        }

        const stmt = db.prepare("UPDATE test SET test_approved = 0 WHERE test_id = ?");
        const info = stmt.run(testId);

        if (info.changes === 0) {
            console.log("⚠️ Nenhuma alteração foi feita (talvez o teste já esteja reprovado).");
            return;
        }

        console.log(`❌ Teste ${testId} reprovado com sucesso!`);
    }
}