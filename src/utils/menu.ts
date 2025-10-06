import inquirer from "inquirer";
import { AuthenticatedUser, hasPermission } from "./auth";
import { AircraftService } from "../services/aircraft";
import { PartService } from "../services/part";
import { EmployeeService } from "../services/employee";
import { TestService } from "../services/test";
import { StageService } from "../services/stage";
import { ReportService } from "./reports";

// Função para filtrar opções de menu com base na permissão
const filterOptionsByPermission = (options: any[], user: AuthenticatedUser) => {
    return options.filter(option => {
        // Itens sem permissão definida (como 'Voltar' ou Separator) são sempre exibidos
        if (!option.permission) return true;
        return hasPermission(user, option.permission);
    });
};

export async function showMainMenu(user: AuthenticatedUser) {
    console.log(`\n👋 Bem-vindo, ${user.emp_name} (${user.role_name})!`);

    while (true) {
        const menuOptions = [
            { name: "✈️   Gerenciar aeronaves", value: "aircraft", permission: "aircraft:read" },
            { name: "👷   Gerenciar funcionários", value: "employee", permission: "employee:read" },
            { name: "🔩   Gerenciar peças", value: "part", permission: "part:read" },
            { name: "🧱   Gerenciar etapas", value: "stage", permission: "stage:read" },
            { name: "🧪   Gerenciar testes", value: "test", permission: "test:read" },
            { name: "📄   Gerar relatório (etapa concluída)", value: "report", permission: "report:generate" },
            new inquirer.Separator(),
            { name: "🚪   Sair", value: "exit" }
        ];

        const { choice } = await inquirer.prompt({
            type: "list",
            name: "choice",
            message: "=== MENU PRINCIPAL ===",
            choices: filterOptionsByPermission(menuOptions, user)
        });

        switch (choice) {
            case "aircraft":
                await handleAircraftMenu(user);
                break;
            case "employee":
                await handleEmployeeMenu(user);
                break;
            case "part":
                await handlePartMenu(user);
                break;
            case "stage":
                await handleStageMenu(user);
                break;
            case "test":
                await handleTestMenu(user);
                break;
            case "report":
                const { stageId } = await inquirer.prompt({
                    type: "number",
                    name: "stageId",
                    message: "ID da etapa concluída:"
                });
                ReportService.generateReportForCompletedStage(stageId);
                break;
            case "exit":
                console.log("Saindo...");
                process.exit(0);
        }
    }
}

async function handleAircraftMenu(user: AuthenticatedUser) {
    const choices = filterOptionsByPermission([
        { name: "Listar todas", value: "list", permission: "aircraft:read" },
        { name: "Criar nova", value: "create", permission: "aircraft:create" },
        { name: "Ver detalhes", value: "details", permission: "aircraft:read" },
        { name: "Atualizar aeronave", value: "update", permission: "aircraft:update" },
        { name: "Deletar aeronave", value: "delete", permission: "aircraft:delete" },
        { name: "Voltar", value: "back" }
    ], user);

    const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "Gerenciar Aeronaves",
        choices
    });
    
    if (action === "back") return;

    if (action === "list") {
        AircraftService.listAircraft();
    } else if (action === "create") {
        const answers = await inquirer.prompt([
            { type: "input", name: "model", message: "Modelo:" },
            { type: "list", name: "type", message: "Tipo:", choices: ["Comercial", "Militar"] },
            { type: "number", name: "capacity", message: "Capacidade:" },
            { type: "number", name: "reach", message: "Alcance (km):" }
        ]);
        AircraftService.createAircraft(answers.model, answers.type as any, answers.capacity, answers.reach);
    } else if (action === "details") {
        const { id } = await inquirer.prompt({ type: "number", name: "id", message: "ID da aeronave:" });
        AircraftService.showAircraftDetails(id);
    } else if (action === "update") {
        const { id } = await inquirer.prompt({ type: "number", name: "id", message: "ID da aeronave a atualizar:" });
        const updates = await inquirer.prompt([
            { type: "input", name: "model", message: "Novo modelo (deixe vazio para manter):" },
            {
                type: "list",
                name: "type",
                message: "Novo tipo:",
                choices: ["Comercial", "Militar", "Manter atual"]
            },
            { type: "input", name: "capacity", message: "Nova capacidade (ou vazio para manter):" },
            { type: "input", name: "reach", message: "Novo alcance (km) (ou vazio para manter):" }
        ]);

        const updateData = {
            air_model: updates.model || undefined,
            air_type: updates.type === "Manter atual" ? undefined : updates.type,
            air_capacity: updates.capacity ? Number(updates.capacity) : undefined,
            air_reach: updates.reach ? Number(updates.reach) : undefined
        };

        AircraftService.updateAircraft(id, updateData);
    } else if (action === "delete") {
        const { id } = await inquirer.prompt({
            type: "number",
            name: "id",
            message: "ID da aeronave a deletar:"
        });
        AircraftService.deleteAircraft(id);
    }
}

async function handlePartMenu(user: AuthenticatedUser) {
    const choices = filterOptionsByPermission([
        { name: "Listar todas", value: "list", permission: "part:read" },
        { name: "Ver detalhes", value: "details", permission: "part:read" },
        { name: "Criar peça", value: "create", permission: "part:create" },
        { name: "Atualizar status", value: "updateStatus", permission: "part:update" },
        { name: "Atualizar dados", value: "updateData", permission: "part:update" },
        { name: "Deletar peça", value: "delete", permission: "part:delete" },
        { name: "Ver histórico", value: "history", permission: "part:read" },
        { name: "Atribuir peça a uma etapa", value: "assign", permission: "part:assign" },
        { name: "Voltar", value: "back" }
    ], user);

    const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "Gerenciar Peças",
        choices
    });

    if (action === "back") return;
    
    if (action === "list") {
        PartService.listParts();
    } else if (action === "details") {
        const { id } = await inquirer.prompt({ type: "number", name: "id", message: "ID da peça:" });
        PartService.getPartDetails(id);
    } else if (action === "create") {
        const answers = await inquirer.prompt([
            { type: "input", name: "name", message: "Nome:" },
            {
                type: "list",
                name: "type",
                message: "Tipo:",
                choices: ["Nacional", "Importada"]
            },
            { type: "input", name: "supplier", message: "Fornecedor:" }
        ]);
        PartService.createPart(answers.name, answers.type as any, answers.supplier);
    } else if (action === "updateStatus") {
        const answers = await inquirer.prompt([
            { type: "number", name: "id", message: "ID da peça:" },
            {
                type: "list",
                name: "status",
                message: "Novo status:",
                choices: ["Em produção", "Em transporte", "Pronta para uso"]
            }
        ]);
        PartService.updatePartStatus(answers.id, answers.status as any);
    } else if (action === "updateData") {
        const { id } = await inquirer.prompt({ type: "number", name: "id", message: "ID da peça a atualizar:" });
        const updates = await inquirer.prompt([
            { type: "input", name: "name", message: "Novo nome (deixe vazio para manter):" },
            {
                type: "list",
                name: "type",
                message: "Novo tipo:",
                choices: ["Nacional", "Importada", "Manter atual"]
            },
            { type: "input", name: "supplier", message: "Novo fornecedor (ou vazio para manter):" }
        ]);
        const updateData = {
            part_name: updates.name || undefined,
            part_type: updates.type === "Manter atual" ? undefined : (updates.type as "Nacional" | "Importada"),
            part_supplier: updates.supplier || undefined
        };
        PartService.updatePartData(id, updateData);
    } else if (action === "delete") {
        const { id } = await inquirer.prompt({
            type: "number",
            name: "id",
            message: "ID da peça a deletar:"
        });
        PartService.deletePart(id);
    } else if (action === "history") {
        const { id } = await inquirer.prompt({ type: "number", name: "id", message: "ID da peça:" });
        PartService.getPartHistory(id);
    } else if (action === "assign") {
        const answers = await inquirer.prompt([
            { type: "number", name: "partId", message: "ID da peça:" },
            { type: "number", name: "stageId", message: "ID da etapa:" }
        ]);
        PartService.assignPartToStage(answers.partId, answers.stageId);
    }
}

async function handleEmployeeMenu(user: AuthenticatedUser) {
    const choices = filterOptionsByPermission([
        { name: "Listar todos", value: "list", permission: "employee:read" },
        { name: "Criar novo", value: "create", permission: "employee:create" },
        { name: "Ver detalhes", value: "details", permission: "employee:read" },
        { name: "Voltar", value: "back" }
    ], user);

    const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "Gerenciar Funcionários",
        choices
    });

    if (action === "back") return;

    if (action === "list") {
        EmployeeService.listEmployees();
    } else if (action === "create") {
        const answers = await inquirer.prompt([
            { type: "input", name: "name", message: "Nome:" },
            { type: "input", name: "phone", message: "Telefone:" },
            { type: "input", name: "email", message: "Email:" },
            { type: "password", name: "password", message: "Senha:", mask: "*" },
            { type: "number", name: "roleId", message: "ID do cargo (1:Admin, 2:Técnico, 3:Gerente):" },
            { type: "input", name: "state", message: "Estado (sigla):" },
            { type: "input", name: "city", message: "Cidade:" },
            { type: "input", name: "neighborhood", message: "Bairro:" }
        ]);

        EmployeeService.createEmployee(
            answers.name,
            answers.phone,
            answers.email,
            answers.password,
            answers.roleId,
            {
                state: answers.state,
                city: answers.city,
                neighborhood: answers.neighborhood
            }
        );
    } else if (action === "details") {
        const { id } = await inquirer.prompt({ type: "number", name: "id", message: "ID do funcionário:" });
        EmployeeService.getEmployeeById(id);
    }
}

async function handleStageMenu(user: AuthenticatedUser) {
    const choices = filterOptionsByPermission([
        { name: "Listar todas", value: "list", permission: "stage:read" },
        { name: "Criar nova", value: "create", permission: "stage:create" },
        { name: "Atualizar status", value: "update", permission: "stage:update" },
        { name: "Atribuir funcionário", value: "assign", permission: "stage:assign" },
        { name: "Ver detalhes", value: "details", permission: "stage:read" },
        { name: "Ver funcionários da etapa", value: "employees", permission: "stage:read" },
        { name: "Voltar", value: "back" }
    ], user);

    const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "Gerenciar Etapas",
        choices
    });

    if (action === "back") return;

    if (action === "list") {
        StageService.listStages();
    } else if (action === "create") {
        const answers = await inquirer.prompt([
            { type: "input", name: "name", message: "Nome da etapa:" },
            { type: "input", name: "deadline", message: "Prazo (YYYY-MM-DD HH:MM:SS):" },
            { type: "number", name: "aircraftId", message: "ID da aeronave:" }
        ]);
        StageService.createStage(answers.name, answers.deadline, answers.aircraftId);
    } else if (action === "update") {
        const answers = await inquirer.prompt([
            { type: "number", name: "id", message: "ID da etapa:" },
            {
                type: "list",
                name: "status",
                message: "Novo status:",
                choices: ["Pendente", "Andamento", "Concluída"]
            }
        ]);
        StageService.updateStageStatus(answers.id, answers.status as any);
    } else if (action === "assign") {
        const answers = await inquirer.prompt([
            { type: "number", name: "empId", message: "ID do funcionário:" },
            { type: "number", name: "stageId", message: "ID da etapa:" }
        ]);
        StageService.assignEmployeeToStage(answers.empId, answers.stageId);
    } else if (action === "details") {
        const { id } = await inquirer.prompt({
            type: "number",
            name: "id",
            message: "ID da etapa:"
        });
        StageService.getStageDetails(id);
    } else if (action === "employees") {
        const { stageId } = await inquirer.prompt({
            type: "number",
            name: "stageId",
            message: "ID da etapa:"
        });
        StageService.getStageEmployees(stageId);
    }
}

async function handleTestMenu(user: AuthenticatedUser) {
    const choices = filterOptionsByPermission([
        { name: "Criar teste", value: "create", permission: "test:create" },
        { name: "Aprovar teste", value: "approve", permission: "test:update" },
        { name: "Reprovar teste", value: "reject", permission: "test:update" },
        { name: "Listar testes de uma etapa", value: "list", permission: "test:read" },
        { name: "Voltar", value: "back" }
    ], user);

    const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "Gerenciar Testes",
        choices
    });

    if (action === "back") return;

    if (action === "create") {
        const answers = await inquirer.prompt([
            { type: "number", name: "stageId", message: "ID da etapa:" },
            {
                type: "list",
                name: "type",
                message: "Tipo de teste:",
                choices: ["Elétrico", "Hidráulico", "Aerodinâmico"]
            }
        ]);
        TestService.createTest(answers.stageId, answers.type as any);
    } else if (action === "approve") {
        const { testId } = await inquirer.prompt({ type: "number", name: "testId", message: "ID do teste:" });
        TestService.approveTest(testId);
    } else if (action === "reject") {
        const { testId } = await inquirer.prompt({ type: "number", name: "testId", message: "ID do teste:" });
        TestService.rejectTest(testId);
    } else if (action === "list") {
        const { stageId } = await inquirer.prompt({ type: "number", name: "stageId", message: "ID da etapa:" });
        TestService.listTestsByStage(stageId);
    }
}