# ✈️ Aerocode - GUI do Sistema de Gestão de Produção

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

Este repositório contém o front-end (GUI) para o **Aerocode**, um Sistema de Gestão da Produção de Aeronaves. Este projeto foi desenvolvido em **Next.js** e **React** como a Atividade de Avaliação 2 (AV2), servindo como a interface de usuário moderna para o back-end CLI (AV1).

## 📄 Sobre o Projeto

Este projeto é a evolução do sistema de linha de comando (CLI) da Aerocode. A AV2 estabeleceu a necessidade de uma interface gráfica (GUI) para resolver os desafios de usabilidade da CLI, que possuía uma curva de aprendizado longa.

Esta Aplicação de Página Única (SPA) foi construída para oferecer uma experiência de usuário fluida e visualmente intuitiva, facilitando o gerenciamento da produção e posicionando o produto Aerocode para competir no mercado de grandes empresas aeroespaciais, como Boeing e Airbus.

## ✨ Funcionalidades

A interface web implementa todos os módulos de gerenciamento definidos nos requisitos da AV1, incluindo:

* **✈️ Gestão de Aeronaves:**
    * Cadastro e listagem de aeronaves (Comercial ou Militar).
    * Visualização de detalhes, capacidade e alcance.

* **🔩 Gestão de Peças:**
    * Registro de peças (Nacionais ou Importadas) e fornecedores.
    * Atualização de status (Em produção, Em transporte, Pronta).

* **🧱 Gestão de Etapas de Produção:**
    * Definição de etapas com prazos e status (Pendente, Em andamento, Concluída).
    * Controle de fluxo para garantir a ordem correta das etapas.

* **👷 Gestão de Funcionários e Permissões:**
    * Cadastro de funcionários e sistema de autenticação.
    * Controle de acesso baseado em níveis (Administrador, Engenheiro, Operador).

* **🧪 Gestão de Testes:**
    * Registro de testes Elétricos, Hidráulicos e Aerodinâmicos (Aprovado/Reprovado).

## 💻 Tecnologias Utilizadas

* **Framework:** [Next.js](https://nextjs.org/)
* **Biblioteca:** [React](https://reactjs.org/)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)

## 🚀 Começando

Siga as instruções abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

* **Node.js** (versão 18.x ou superior)
* **npm** (geralmente instalado com o Node.js)

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/MagNumGomes/AV2-Aerocode](https://github.com/MagNumGomes/AV2-Aerocode)
    ```

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd AV2-Aerocode
    ```

3.  **Instale as dependências:**
    (A flag `--legacy-peer-deps` é usada para resolver conflitos de versão mais antigos).
    ```bash
    npm install --legacy-peer-deps
    ```

4.  **Execute a aplicação:**
    O comando abaixo inicia o servidor de desenvolvimento do Next.js.
    ```bash
    npm run dev
    ```

Após executar o comando, o sistema estará acessível em `http://localhost:3000` no seu navegador.

> **Login Padrão (Sugestão de Demo):**
> * **Usuário:** `admin`
> * **Senha:** `admin123`
