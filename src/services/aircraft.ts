import db from "../db/connection";

interface Aircraft {
    air_id: number;
    air_model: string;
    air_type: "Comercial" | "Militar";
    air_capacity: number;
    air_reach: number;
}

interface Stage {
    stage_id: number;
    stage_name: string;
    stage_status: "Pendente" | "Andamento" | "Concluída";
    stage_deadline: string;
}

export class AircraftService {
    static createAircraft(model: string, type: "Comercial" | "Militar", capacity: number, reach: number) {
        const stmt = db.prepare(`
            INSERT INTO aircraft (air_model, air_type, air_capacity, air_reach)
            VALUES (?, ?, ?, ?)
        `);
        const info = stmt.run(model, type, capacity, reach);
        console.log(`✅ Aeronave criada com ID: ${info.lastInsertRowid}`);
    }

    static listAircraft() {
        const aircrafts = db.prepare("SELECT * FROM aircraft").all() as Aircraft[];
        if (aircrafts.length === 0) {
            console.log("Nenhuma aeronave cadastrada.");
            return;
        }
        aircrafts.forEach(a => {
            console.log(`ID: ${a.air_id} | Modelo: ${a.air_model} | Tipo: ${a.air_type} | Capacidade: ${a.air_capacity} | Alcance: ${a.air_reach}`);
        });
    }

    static showAircraftDetails(airId: number) {
        const aircraft = db.prepare("SELECT * FROM aircraft WHERE air_id = ?").get(airId) as Aircraft | undefined;
        if (!aircraft) {
            console.log("Aeronave não encontrada.");
            return;
        }

        console.log("\n=== DETALHES DA AERONAVE ===");
        console.log(`ID: ${aircraft.air_id}`);
        console.log(`Modelo: ${aircraft.air_model}`);
        console.log(`Tipo: ${aircraft.air_type}`);
        console.log(`Capacidade (passageiros ou carga): ${aircraft.air_capacity}`);
        console.log(`Alcance (km): ${aircraft.air_reach}`);

        const stages = db.prepare(`
            SELECT stage_id, stage_name, stage_status, stage_deadline
            FROM stage
            WHERE air_id = ?
        `).all(airId) as Stage[];

        if (stages.length > 0) {
            console.log("\nEtapas:");
            stages.forEach(s => {
                console.log(`- ${s.stage_name} | Status: ${s.stage_status} | Prazo: ${s.stage_deadline}`);
            });
        }
    }

    static updateAircraft(id: number, updates: Partial<Aircraft>) {
        const aircraft = db.prepare("SELECT * FROM aircraft WHERE air_id = ?").get(id) as Aircraft | undefined;
        if (!aircraft) {
            console.log("Aeronave não encontrada.");
            return;
        }

        const newModel = updates.air_model || aircraft.air_model;
        const newType = updates.air_type || aircraft.air_type;
        const newCapacity = updates.air_capacity ?? aircraft.air_capacity;
        const newReach = updates.air_reach ?? aircraft.air_reach;

        db.prepare(`
            UPDATE aircraft
            SET air_model = ?, air_type = ?, air_capacity = ?, air_reach = ?
            WHERE air_id = ?
        `).run(newModel, newType, newCapacity, newReach, id);

        console.log("✏️ Aeronave atualizada com sucesso!");
    }

    static deleteAircraft(id: number) {
        const result = db.prepare("DELETE FROM aircraft WHERE air_id = ?").run(id);
        if (result.changes === 0) {
            console.log("Aeronave não encontrada ou já removida.");
            return;
        }

        console.log("🗑️ Aeronave deletada com sucesso!");
    }
}