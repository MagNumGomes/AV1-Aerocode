import db from "../db/connection";

interface Part {
    part_id: number;
    part_name: string;
    part_type: "Nacional" | "Importada";
    part_supplier: string;
    part_status: "Em produção" | "Em transporte" | "Pronta para uso";
}

interface PartStatus {
    ps_status: "Em produção" | "Em transporte" | "Pronta para uso";
    created_at: string;
}

export class PartService {
    static createPart(name: string, type: "Nacional" | "Importada", supplier: string) {
        const stmt = db.prepare(`
            INSERT INTO part (part_name, part_type, part_supplier, part_status)
            VALUES (?, ?, ?, 'Em produção')
        `);
        const info = stmt.run(name, type, supplier);
        console.log(`Peça criada com ID: ${info.lastInsertRowid}`);
    }

    static updatePartStatus(
        partId: number,
        newStatus: "Em produção" | "Em transporte" | "Pronta para uso"
    ) {
        const part = db.prepare("SELECT part_status FROM part WHERE part_id = ?").get(partId) as
            | { part_status: Part["part_status"] }
            | undefined;

        if (!part) {
            console.log("❌ Peça não encontrada.");
            return;
        }

        const statusOrder = ["Em produção", "Em transporte", "Pronta para uso"];
        const currentIndex = statusOrder.indexOf(part.part_status);
        const newIndex = statusOrder.indexOf(newStatus);

        if (newIndex === -1) {
            console.log("❌ Status inválido.");
            return;
        }

        if (newIndex < currentIndex) {
            console.log(
                `⚠️ Não é permitido regredir o status. (Atual: ${part.part_status}, Tentativa: ${newStatus})`
            );
            return;
        }

        if (newIndex === currentIndex) {
            console.log(`⚠️ Peça já está com status "${newStatus}".`);
            return;
        }

        db.prepare("UPDATE part SET part_status = ? WHERE part_id = ?").run(newStatus, partId);
        db.prepare("INSERT INTO part_status (ps_status, part_id) VALUES (?, ?)").run(newStatus, partId);

        console.log(`✅ Status atualizado para "${newStatus}" e registrado no histórico.`);
    }

    static listParts() {
        const parts = db.prepare("SELECT * FROM part").all() as Part[];

        if (parts.length === 0) {
            console.log("Nenhuma peça cadastrada.");
            return;
        }

        console.log("\n=== LISTA DE PEÇAS ===");
        parts.forEach(p => {
            console.log(
                `ID: ${p.part_id} | Nome: ${p.part_name} | Tipo: ${p.part_type} | Fornecedor: ${p.part_supplier} | Status: ${p.part_status}`
            );
        });
    }

    static getPartDetails(id: number) {
        const part = db.prepare("SELECT * FROM part WHERE part_id = ?").get(id) as Part | undefined;

        if (!part) {
            console.log("Peça não encontrada.");
            return;
        }

        console.log("\n=== DETALHES DA PEÇA ===");
        console.log(`ID: ${part.part_id}`);
        console.log(`Nome: ${part.part_name}`);
        console.log(`Tipo: ${part.part_type}`);
        console.log(`Fornecedor: ${part.part_supplier}`);
        console.log(`Status: ${part.part_status}`);
    }

    static getPartHistory(partId: number) {
        const history = db.prepare(`
            SELECT ps_status, created_at
            FROM part_status
            WHERE part_id = ?
            ORDER BY created_at ASC
        `).all(partId) as PartStatus[];

        if (history.length === 0) {
            console.log("Nenhum histórico encontrado para esta peça.");
            return;
        }

        console.log(`\n=== HISTÓRICO DA PEÇA ${partId} ===`);
        history.forEach(h => {
            console.log(`[${h.created_at}] ${h.ps_status}`);
        });
    }

    static assignPartToStage(partId: number, stageId: number) {
        try {
            db.prepare(`
                INSERT INTO stage_part (part_id, stage_id)
                VALUES (?, ?)
            `).run(partId, stageId);
            console.log(`Peça ${partId} atribuída à etapa ${stageId}`);
        } catch (e) {
            const err = e as { code?: string; message: string };
            if (err.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
                console.log("Peça já está atribuída a esta etapa.");
            } else if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
                console.log("ID de peça ou etapa inválido.");
            } else {
                console.error("Erro:", err.message);
            }
        }
    }

    static updatePartData(
        partId: number,
        updates: Partial<Omit<Part, "part_id" | "part_status">>
    ) {
        const part = db.prepare("SELECT * FROM part WHERE part_id = ?").get(partId) as Part | undefined;
        if (!part) {
            console.log("❌ Peça não encontrada.");
            return;
        }

        const newName = updates.part_name || part.part_name;
        const newType = updates.part_type || part.part_type;
        const newSupplier = updates.part_supplier || part.part_supplier;

        db.prepare(
            `
            UPDATE part
            SET part_name = ?, part_type = ?, part_supplier = ?
            WHERE part_id = ?
        `
        ).run(newName, newType, newSupplier, partId);

        console.log("✏️ Dados da peça atualizados com sucesso!");
    }

    static deletePart(partId: number) {
        const result = db.prepare("DELETE FROM part WHERE part_id = ?").run(partId);

        if (result.changes === 0) {
            console.log("❌ Peça não encontrada ou já deletada.");
            return;
        }

        console.log("🗑️ Peça deletada com sucesso!");
    }
}