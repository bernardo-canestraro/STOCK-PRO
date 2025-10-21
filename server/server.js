// server/server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "167.99.252.245",
  user: "ESW_E5",
  password: "X3Q3FUHogo_bVW5R",
  database: "ESW_E5"
});

db.connect(err => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
  } else {
    console.log("Conectado ao MySQL com sucesso!");
  }
});

app.get("/", (req, res) => {
  res.send("API do Supermercado Sol funcionando!");
});

app.get("/produtos", (req, res) => {
  db.query("SELECT * FROM produtos", (err, results) => {
    if (err) res.status(500).send("Erro ao buscar produtos");
    else res.json(results);
  });
});

app.post("/produtos", (req, res) => {
  const { nome, preco } = req.body;
  db.query(
    "INSERT INTO produtos (Nome, Preco) VALUES (?, ?)",
    [nome, preco],
    (err) => {
      if (err) res.status(500).send("Erro ao inserir produto");
      else res.send("Produto inserido com sucesso!");
    }
  );
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
