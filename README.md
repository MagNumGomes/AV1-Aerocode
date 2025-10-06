# ✈️ Aerocode - Sistema de Gestão de Produção de Aeronaves

![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

Sistema de interface de linha de comando (CLI) para simular e gerenciar o processo de produção de aeronaves, inspirado nas necessidades de grandes empresas do setor aeroespacial, como a Embraer. Este projeto foi desenvolvido como o Produto Mínimo Viável (MVP) da empresa fictícia Aerocode.

## 📄 Sobre o Projeto

A Aerocode é uma empresa especializada no desenvolvimento de software para a indústria aeronáutica. Este sistema é o seu primeiro produto, uma ferramenta CLI robusta para gerenciar todas as fases da construção de uma aeronave, desde o cadastro inicial de peças e etapas até a geração de relatórios para entrega final ao cliente. A escolha por uma interface de linha de comando foi estratégica para garantir eficiência, baixo custo e a capacidade de automatizar tarefas em ambientes onde a interação visual é limitada.

## ✨ Funcionalidades

O sistema permite um controle detalhado sobre o fluxo de produção, incluindo:

* **✈️ Gestão de Aeronaves:**
    * Cadastro de aeronaves com código único, modelo, tipo (Comercial ou Militar), capacidade e alcance.
    * Visualização de detalhes completos de cada aeronave de forma organizada.

* **🔩 Gestão de Peças:**
    * Registro de peças (Nacionais ou Importadas) com nome, fornecedor e status.
    * Métodos para atualizar o status de uma peça (Em produção, Em transporte, Pronta para uso).

* **🧱 Gestão de Etapas de Produção:**
    * Definição de etapas com nome, prazo e status (Pendente, Em andamento, Concluída).
    * Controle de fluxo que impede a conclusão de uma etapa sem que a anterior tenha sido finalizada.

* **👷 Gestão de Funcionários e Permissões:**
    * Cadastro de funcionários com identificador único, nome, telefone e endereço.
    * Sistema de autenticação com login e senha.
    * Controle de acesso baseado em níveis de permissão (ex: Administrador, Gerente, Técnico) para restringir o acesso a funcionalidades críticas.
    * Associação de um ou mais funcionários a etapas específicas da produção.

* **🧪 Gestão de Testes:**
    * Execução e registro de testes Elétricos, Hidráulicos e Aerodinâmicos.
    * Cada teste possui um resultado de "Aprovado" ou "Reprovado".

* **📄 Relatórios e Persistência:**
    * Geração de um relatório final salvo em arquivo de texto (`.txt`) com todos os detalhes da aeronave pronta para entrega.
    * Persistência de todos os dados em um banco de dados local (SQLite).

## 💻 Tecnologias Utilizadas

* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Ambiente de Execução:** [Node.js](https://nodejs.org/)
* **Banco de Dados:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
* **Interface de Comando:** [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

## 🚀 Começando

Siga as instruções abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

* **Node.js** (versão 18.x ou superior)
* **npm** (geralmente instalado com o Node.js)

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/MagNumGomes/AV1-Aerocode
    ```

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd AV1-Aerocode
    ```

3.  **Instale as dependências:**
    Este comando irá baixar todas as bibliotecas listadas no `package.json`.
    ```bash
    npm install
    ```

4.  **Execute a aplicação:**
    O comando abaixo utiliza o `ts-node` para compilar e executar o projeto em um único passo.
    ```bash
    npx ts-node src/app.ts
    ```

Após executar o comando, o sistema de banco de dados será inicializado e a tela de login aparecerá no seu terminal.

> **Login Padrão (Admin):**
> * **Email:** `admin@aerocode.com`
> * **Senha:** `admin123`

## 📂 Estrutura de Pastas

O projeto está organizado da seguinte forma:

```
/av1
├── node_modules/
├── src/
│   ├── db/
│   │   ├── connection.ts   # Configuração da conexão com o SQLite
│   │   └── schema.ts       # Criação das tabelas e dados iniciais
│   ├── services/
│   │   ├── aircraft.ts     # Lógica de negócio para aeronaves
│   │   ├── employee.ts     # Lógica de negócio para funcionários
│   │   ├── part.ts         # Lógica de negócio para peças
│   │   ├── stage.ts        # Lógica de negócio para etapas
│   │   └── test.ts         # Lógica de negócio para testes
│   ├── utils/
│   │   ├── auth.ts         # Funções de login e controle de permissão
│   │   ├── menu.ts         # Lógica da interface de linha de comando
│   │   └── reports.ts      # Geração de relatórios
│   └── app.ts              # Ponto de entrada da aplicação
├── .gitignore
├── package-lock.json
├── package.json
└── tsconfig.json
```
