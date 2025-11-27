# Bem-vindo ao seu projeto Stock-Pro

## Informações do projeto

**IDE - VSCode**

Clone o ropositorio do GitHub.

Instale

Follow these steps:

```sh
# Passo 1: Instale as dependências necessárias.
npm i

# Passo 2: Instale as dependências necessárias para rodar o servidor.
npm init -y
npm install express mysql2 cors bcrypt express-session exceljs axios xlsx file-saver cookie-parser recharts lucide-react

# Passo 3: Para rodar o servidor.
node server.js

# Passo 4: Inicie o servidor de desenvolvimento com recarregamento automático e visualização instantânea.
npm run dev
```

## Quais tecnologias são usadas neste projeto??

Este projeto foi construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

<!-- 
PASSO A PASSO PARA EXECUTAR O PROJETO STOCK-PRO

Este guia explica, de forma simples e direta, como clonar o repositório, instalar dependências e rodar tanto o front-end (React + Vite) quanto o back-end (Node.js + Express + MySQL).

1. PRÉ-REQUISITOS

Antes de iniciar, é necessário ter instalado:

Node.js (versão 18+)

npm (vem junto com o Node)

MySQL Server (versão 8 ou superior)

Git

VS Code (opcional, mas recomendado)

2. CLONAR O REPOSITÓRIO DO GITHUB

Abra o Terminal ou CMD.

Escolha uma pasta onde o projeto será salvo.

Execute:

git clone https://github.com/SEU-USUARIO/Stock-Pro.git


Observação: Substitua SEU-USUARIO pelo nome correto no GitHub.

Entre na pasta do projeto:

cd Stock-Pro

3. INSTALAR DEPENDÊNCIAS DO FRONT-END

O front-end foi construído com Vite + React + TypeScript + shadcn-ui + Tailwind CSS.

No diretório raiz do projeto, execute:

npm install


Esse comando instala todas as dependências necessárias para rodar a interface.

4. CONFIGURAR O BANCO DE DADOS (MySQL)

Abra o MySQL Workbench, DBeaver ou terminal MySQL.

Crie o banco:

CREATE DATABASE stockpro;


Importe as tabelas (caso exista arquivo .sql no projeto, utilize-o).

Configure as credenciais no arquivo server.js (ou .env caso você use):

Exemplo:

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sua_senha",
  database: "stockpro"
});

5. INSTALAR DEPENDÊNCIAS DO BACK-END

O back-end utiliza:
Express, MySQL2, CORS, Bcrypt, Express-Session, ExcelJS, Axios, Xlsx, File-Saver, Cookie-Parser

Execute no terminal:

npm init -y
npm install express mysql2 cors bcrypt express-session exceljs axios xlsx file-saver cookie-parser recharts lucide-react

6. RODAR O SERVIDOR (BACK-END)

Após instalar tudo:

node server.js


O servidor deverá iniciar em algo como:

Servidor rodando na porta 3001
Conectado ao banco de dados MySQL!

7. RODAR O FRONT-END (INTERFACE DO USUÁRIO)

Para abrir o sistema no navegador:

npm run dev


Após iniciar, o Vite mostrará algo como:

http://localhost:5173/


Abra esse link no navegador para usar o sistema.

8. ESTRUTURA DO SISTEMA APÓS CONFIGURADO

Front-end:
http://localhost:5173/

Back-end (API):
http://localhost:3001/

Banco de dados:
MySQL → stockpro

9. PROBLEMAS COMUNS E COMO RESOLVER
Problema	Causa	Solução
Server.js não inicia	Banco de dados errado	Verificar credenciais MySQL
“Module not found”	Dependências faltando	Rodar npm install novamente
API não responde	Porta em uso	Trocar porta no server.js
Front não carrega	Vite não iniciado	Rodar npm run dev
10. PROJETO PRONTO PARA USO

Após tudo configurado:

Acesse o painel lateral (AppSidebar)

Visualize produtos, entradas, saídas, relatórios, categorias e usuários

Realize cadastros, edições e exporte planilhas -->