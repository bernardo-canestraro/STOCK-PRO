// server/server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors"; // ✅ Apenas um import
import bcrypt from "bcrypt";
import session from 'express-session';

const app = express();

// ✅ Configuração CORS correta
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

// ✅ Session config
app.use(session({
  name: 'supermercadoSession',
  secret: 'sua-chave-secreta-aqui-muito-longa-e-complexa',
  resave: true,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Middleware de autenticação
const requireAuth = (req, res, next) => {
  console.log("🔍 Verificando session:", req.session);
  if (!req.session.userId) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }
  next();
};

const db = mysql.createPool({
  host: "167.99.252.245",
  user: "ESW_E5",
  password: "X3Q3FUHogo_bVW5R",
  database: "ESW_E5",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  reconnect: true
});

// Teste a conexão
db.getConnection((err, connection) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
  } else {
    console.log("Conectado ao MySQL com sucesso!");
    connection.release();
  }
});

// ============================
// ROTA DEBUG SESSION
// ============================
app.get("/debug-session", (req, res) => {
  console.log("=== DEBUG SESSION ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session userId:", req.session.userId);
  console.log("Session completa:", req.session);
  
  res.json({
    sessionId: req.sessionID,
    userId: req.session.userId,
    username: req.session.username,
    session: req.session
  });
});

// ============================
// LOGIN - CORRIGIDO
// ============================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log("📥 Tentativa de login:", username);
  console.log("🔍 Session ANTES do login:", req.session);

  if (!username || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
  }

  db.query(
    `SELECT u.IdUsuario, u.NomeUsuario, u.Senha_hash, u.IdPerfil,
            p.NomePerfil
     FROM Usuario u
     JOIN Perfis p ON u.IdPerfil = p.IdPerfil
     WHERE u.NomeUsuario = ? AND u.CdStatus = 1`,
    [username],
    (err, results) => {
      if (err) {
        console.error("❌ Erro no banco:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }
      
      if (results.length === 0) {
        console.log("❌ Usuário não encontrado ou inativo:", username);
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const user = results[0];
      console.log("🔍 Usuário encontrado:", user);

      // ✅ VERIFICAÇÃO DE SENHA
      if (password !== user.Senha_hash) {
        console.log("❌ Senha incorreta para:", username);
        return res.status(401).json({ error: "Senha incorreta" });
      }

      console.log("✅ Senha válida");

      // ✅✅✅ SALVAR NA SESSION - CORRIGIDO
      req.session.userId = user.IdUsuario;
      req.session.username = user.NomeUsuario;
      req.session.profileId = user.IdPerfil;

      // ✅ FORÇAR SALVAMENTO DA SESSION
      req.session.save((err) => {
        if (err) {
          console.error("❌ Erro ao salvar sessão:", err);
          return res.status(500).json({ error: "Erro ao criar sessão" });
        }

        console.log("✅ Session DEPOIS do login:", req.session);
        console.log("✅ Session ID:", req.sessionID);

        // Buscar permissões
        db.query(
          `SELECT pr.NomePrograma
           FROM ProgramaXPerfil pxp
           JOIN Programa pr ON pxp.IdPrograma = pr.IdPrograma
           WHERE pxp.IdPerfil = ? AND pr.CdStatus = 1`,
          [user.IdPerfil],
          (err3, rows) => {
            if (err3) {
              console.error("❌ Erro ao buscar permissões:", err3);
              return res.status(500).json({ error: "Erro ao buscar permissões" });
            }

            const permissoes = rows.map(r => r.NomePrograma);

            console.log("✅ Login finalizado - Enviando resposta");
            res.json({
              success: true,
              id: user.IdUsuario,
              username: user.NomeUsuario,
              profileId: user.IdPerfil,
              profileName: user.NomePerfil,
              programs: permissoes,
              sessionId: req.sessionID // Para debug
            });
          }
        );
      });
    }
  );
});

// ============================
// LOGOUT
// ============================
app.post("/logout", requireAuth, (req, res) => {
  console.log("🚪 Logout solicitado - Session antes:", req.session);
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Erro ao fazer logout:", err);
      return res.status(500).json({ error: "Erro ao fazer logout" });
    }
    console.log("✅ Logout realizado com sucesso");
    res.json({ message: "Logout realizado com sucesso" });
  });
});

// ============================
// CATEGORIAS - CORRIGIDAS
// ============================
app.get("/categoria", requireAuth, (req, res) => {
  const nome = req.query.nome ? String(req.query.nome).trim() : "";
  const status = req.query.status ? String(req.query.status).trim().toLowerCase() : "todos";

  let sql = "SELECT * FROM Categoria";
  const params = [];
  const where = [];

  if (nome) {
    where.push("NomeCategoria LIKE ?");
    params.push(`%${nome}%`);
  }

  if (status && status !== "todos") {
    let cdStatus;

    if (status === "ativo" || status === "1") cdStatus = 1;
    else if (status === "inativo" || status === "0") cdStatus = 0;

    if (typeof cdStatus !== "undefined") {
      where.push("CdStatus = ?");
      params.push(cdStatus);
    }
  }

  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }

  console.log("Query categoria:", req.session.userId, sql, params);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erro MySQL ao buscar categoria:", err);
      return res.status(500).json({
        error: "Erro ao buscar categoria",
        details: err.message,
      });
    } else {
      res.json(results);
    }
  });
});

app.post("/categoria", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { NomeCategoria, CdStatus } = req.body;

  console.log("📥 Criando categoria - UserId:", userId);

  if (!NomeCategoria || CdStatus === undefined || CdStatus === null) {
    return res.status(400).send("Todos os campos são obrigatórios");
  }

  const query = `
    INSERT INTO Categoria 
    (NomeCategoria, IdCadastroUsu, DtCadastro, IdAlteracaoUsu, DtAlteracao, IdCCancelamentoUsu, DtCancelamento, CdStatus)
    VALUES (?, ?, NOW(), NULL, NULL, NULL, NULL, ?)
  `;

  db.query(query, [NomeCategoria, userId, CdStatus], (err, results) => {
    if (err) {
      console.error("Erro ao criar categoria:", err);
      return res.status(500).send("Erro ao criar categoria");
    }

    const novaCategoria = {
      IdCategoria: results.insertId,
      NomeCategoria,
      CdStatus,
    };

    res.status(201).json(novaCategoria);
  });
});

app.put("/categoria/:id", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  const { NomeCategoria, CdStatus } = req.body;

  console.log("✏️ Atualizando categoria - UserId:", userId);

  if (!NomeCategoria || CdStatus === undefined || CdStatus === null) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const query = `
    UPDATE Categoria
    SET NomeCategoria = ?, 
        CdStatus = ?, 
        IdAlteracaoUsu = ?, 
        DtAlteracao = NOW() 
    WHERE IdCategoria = ?
  `;

  db.query(query, [NomeCategoria, CdStatus, userId, id], (err, results) => {
    if (err) {
      console.error("Erro ao atualizar categoria:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    const categoriaAtualizada = {
      IdCategoria: parseInt(id),
      NomeCategoria,
      CdStatus
    };

    res.status(200).json(categoriaAtualizada);
  });
});

// ============================
// LISTAR PRODUTOS
// ============================
app.get("/produto", requireAuth, (req, res) => {
  const nome = req.query.nome ? String(req.query.nome).trim() : "";
  const codigo = req.query.codigo ? String(req.query.codigo).trim() : "";
  const categoriaId = req.query.categoriaId ? String(req.query.categoriaId).trim() : "";
  const status = req.query.status
    ? String(req.query.status).trim().toLowerCase()
    : "todos";

  let sql = "SELECT * FROM Produto";
  const params = [];
  const where = [];

  if (nome) {
    where.push("NomeProduto LIKE ?");
    params.push(`%${nome}%`);
  }

  if (codigo) {
    where.push("CodProduto LIKE ?");
    params.push(`%${codigo}%`);
  }

  if (categoriaId && categoriaId !== "0") {
    where.push("IdCategoriaFK = ?");
    params.push(categoriaId);
  }

  if (status && status !== "todos") {
    let cdStatus;

    if (status === "ativo" || status === "1") cdStatus = 1;
    else if (status === "inativo" || status === "0") cdStatus = 0;

    if (cdStatus !== undefined) {
      where.push("CdStatus = ?");
      params.push(cdStatus);
    }
  }

  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }

  console.log("📌 Query produto:", req.session.userId, sql, params);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Erro MySQL ao buscar produtos:", err);
      return res.status(500).json({
        error: "Erro ao buscar produtos",
        details: err.message,
      });
    }

    res.json(results);
  });
});

app.post("/produto", requireAuth, (req, res) => {
  const userId = req.session.userId;

  const {
    CodProduto,
    NomeProduto,
    Descrecao,
    Preco,
    UniMedida,
    IdSetorFK,
    IdCategoriaFK,
    EstMinimo,
    CdStatus
  } = req.body;

  console.log("📥 Criando produto - UserId:", userId);

  if (
    !CodProduto ||
    !NomeProduto ||
    !Descrecao ||
    Preco == null ||
    EstMinimo == null ||
    CdStatus == null
  ) {
    return res.status(400).send("Todos os campos obrigatórios devem ser preenchidos");
  }

  const query = `
    INSERT INTO Produto 
    (CodProduto, NomeProduto, Descrecao, Preco, UniMedida,
     IdSetorFK, IdCategoriaFK, EstMinimo,
     IdCadastroUsu, DtCadastro, IdAlteracaoUsu, DtAlteracao,
     IdCCancelamentoUsu, DtCancelamento, CdStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NULL, NULL, NULL, NULL, ?)
  `;

  db.query(
    query,
    [
      CodProduto, NomeProduto, Descrecao, Preco, UniMedida,
      IdSetorFK, IdCategoriaFK, EstMinimo,
      userId, CdStatus
    ],
    (err, results) => {
      if (err) {
        console.error("❌ Erro ao criar produto:", err);
        return res.status(500).send("Erro ao criar produto");
      }

      const novoProduto = {
        IdProduto: results.insertId,
        CodProduto,
        NomeProduto,
        Descrecao,
        Preco,
        UniMedida,
        IdSetorFK,
        IdCategoriaFK,
        EstMinimo,
        CdStatus
      };

      res.status(201).json(novoProduto);
    }
  );
});

app.put("/produto/:id", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;

  const {
    CodProduto,
    NomeProduto,
    Descrecao,
    Preco,
    UniMedida,
    IdSetorFK,
    IdCategoriaFK,
    EstMinimo,
    CdStatus
  } = req.body;

  console.log("✏️ Atualizando produto - UserId:", userId);

  if (
    !CodProduto ||
    !NomeProduto ||
    !Descrecao ||
    Preco == null ||
    EstMinimo == null ||
    CdStatus == null
  ) {
    return res.status(400).json({
      error: "Todos os campos obrigatórios devem ser preenchidos",
    });
  }

  const query = `
    UPDATE Produto
    SET CodProduto = ?,
        NomeProduto = ?,
        Descrecao = ?,
        Preco = ?,
        UniMedida = ?,
        IdSetorFK = ?,
        IdCategoriaFK = ?,
        EstMinimo = ?,
        CdStatus = ?,
        IdAlteracaoUsu = ?,
        DtAlteracao = NOW()
    WHERE IdProduto = ?
  `;

  db.query(
    query,
    [
      CodProduto,
      NomeProduto,
      Descrecao,
      Preco,
      UniMedida,
      IdSetorFK,
      IdCategoriaFK,
      EstMinimo,
      CdStatus,
      userId,
      id
    ],
    (err, results) => {
      if (err) {
        console.error("❌ Erro ao atualizar produto:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      const produtoAtualizado = {
        IdProduto: Number(id),
        CodProduto,
        NomeProduto,
        Descrecao,
        Preco,
        UniMedida,
        IdSetorFK,
        IdCategoriaFK,
        EstMinimo,
        CdStatus
      };

      res.status(200).json(produtoAtualizado);
    }
  );
});

app.get("/categoriasDDL", requireAuth, (req, res) => {
  db.query("SELECT * FROM Categoria WHERE CdStatus = 1", (err, rows) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ error: "Erro interno" });
    }
    res.json(rows);
  });
});


// ============================
// Entrada
// ============================
app.post("/entrada", requireAuth, (req, res) => {
  const userId = req.session.userId;

  const {
    IdProduto,
    Quantidade,
    ValorUnitario,
    DataEntrada,
    NotaFiscal,
    Observacoes,
    IdTipoEntrada
  } = req.body;

  // 🔥 CONVERTE A DATA PARA O FORMATO MYSQL
let dataEntradaFormatada = null;
if (DataEntrada) {
  dataEntradaFormatada = new Date(DataEntrada)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
} 

  // ===============================
  // VALIDAR CAMPOS
  // ===============================
  if (!IdProduto || !Quantidade || !ValorUnitario || !IdTipoEntrada) {
    return res.status(400).send("Todos os campos obrigatórios devem ser preenchidos.");
  }

  console.log("📥 Entrada no estoque - UserId:", userId);

  // ===============================
  // VERIFICAR SE O PRODUTO JÁ EXISTE NO ESTOQUE
  // ===============================
  const sqlBuscaEstoque = `
    SELECT * FROM Estoque 
    WHERE IdProduto = ?
    ORDER BY IdEstoque DESC
    LIMIT 1
  `;

  db.query(sqlBuscaEstoque, [IdProduto], (err, resultados) => {
    if (err) {
      console.error("❌ Erro ao consultar estoque:", err);
      return res.status(500).send("Erro ao consultar estoque.");
    }

    const existeEstoque = resultados.length > 0;

    let quantidadeAnterior = existeEstoque ? resultados[0].Quantidade : 0;
    let precoTotalAnterior = existeEstoque ? resultados[0].PrecoTotal : 0;

    const quantidadeNova = quantidadeAnterior + parseInt(Quantidade);
    const precoTotalNovo = precoTotalAnterior + (parseInt(Quantidade) * parseFloat(ValorUnitario));

    // ===============================
    // SE NÃO EXISTE → INSERE NOVO ESTOQUE
    // ===============================
    if (!existeEstoque) {
      const sqlInsertEstoque = `
        INSERT INTO Estoque (
          IdProduto, Quantidade, PrecoTotal, DataEntrada, NF, Descricao,
          IdTipoEntrada, IdCadastroUsu, DtCadastro, CdStatus
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)
      `;

      db.query(
        sqlInsertEstoque,
        [
          IdProduto,
          Quantidade,
          Quantidade * ValorUnitario,
          dataEntradaFormatada,
          NotaFiscal,
          Observacoes,
          IdTipoEntrada,
          userId
        ],
        (err, resultadoEstoque) => {
          if (err) {
            console.error("❌ Erro ao inserir estoque:", err);
            return res.status(500).send("Erro ao inserir estoque");
          }

          registrarHistorico(resultadoEstoque.insertId);
        }
      );
    }

    // ===============================
    // SE JÁ EXISTE → ATUALIZA ESTOQUE
    // ===============================
    else {
      const sqlUpdateEstoque = `
        UPDATE Estoque 
        SET Quantidade = ?, PrecoTotal = ?, DataEntrada = ?, NF = ?, 
            Descricao = ?, IdTipoEntrada = ?, IdAlteracaoUsu = ?, DtAlteracao = NOW()
        WHERE IdEstoque = ?
      `;

      db.query(
        sqlUpdateEstoque,
        [
          quantidadeNova,
          precoTotalNovo,
          dataEntradaFormatada,
          NotaFiscal,
          Observacoes,
          IdTipoEntrada,
          userId,
          resultados[0].IdEstoque
        ],
        (err) => {
          if (err) {
            console.error("❌ Erro ao atualizar estoque:", err);
            return res.status(500).send("Erro ao atualizar estoque");
          }

          registrarHistorico(resultados[0].IdEstoque);
        }
      );
    }

    // ===============================
    // FUNÇÃO PARA REGISTRAR Histórico
    // ===============================
    function registrarHistorico(idEstoque) {
      const sqlHist = `
        INSERT INTO EstoqueHist (
          IdEstoqueFK, IdProdutoFK, QuantidadeAnterior, QuantidadeNova,
          DiferencaQuantidade, PrecoTotalAnterior, PrecoTotalNovo,
          TipoMovimento, IdTipoEntrada, NF, Descricao,
          IdUsuarioMovimento, DtMovimento,
          IdCadastroUsu, DtCadastro, CdStatus
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ENTRADA', ?, ?, ?, ?, NOW(), ?, NOW(), 1)
      `;

      db.query(
        sqlHist,
        [
          idEstoque,
          IdProduto,
          quantidadeAnterior,
          quantidadeNova,
          quantidadeNova - quantidadeAnterior,
          precoTotalAnterior,
          precoTotalNovo,
          IdTipoEntrada,
          NotaFiscal,
          Observacoes,
          userId,
          userId
        ],
        (err) => {
          if (err) {
            console.error("❌ Erro ao inserir histórico de estoque:", err);
            return res.status(500).send("Erro ao inserir histórico de estoque");
          }

          res.status(201).json({
            mensagem: "Entrada registrada com sucesso!"
          });
        }
      );
    }
  });
});


app.get("/produtosDDL", requireAuth, (req, res) => {
  db.query("SELECT * FROM Produto WHERE CdStatus = 1", (err, rows) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ error: "Erro interno" });
    }
    res.json(rows);
  });
});

app.get("/tipoEntradaDDL", requireAuth, (req, res) => {
  db.query("SELECT * FROM TipoEntrada WHERE CdStatus = 1", (err, rows) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ error: "Erro interno" });
    }
    res.json(rows);
  });
});


// ============================
// Saída
// ============================
app.post("/saida", requireAuth, (req, res) => {
  const userId = req.session.userId;

  const {
    IdProduto,
    Quantidade,
    ValorUnitario,
    DataSaida,
    Documento,
    Observacoes,
    IdTipoSaida
  } = req.body;

    // 🔥 CONVERTE A DATA PARA O FORMATO MYSQL
let dataSaidaFormatada = null;
if (DataSaida) {
  dataSaidaFormatada = new Date(DataSaida)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
} 

  // VALIDAÇÃO
  if (!IdProduto || !Quantidade || !IdTipoSaida) {
    return res.status(400).send("Todos os campos obrigatórios devem ser preenchidos.");
  }

  // Buscar último registro de estoque para o produto
  const sqlBuscaEstoque = `
    SELECT * FROM Estoque
    WHERE IdProduto = ?
    ORDER BY IdEstoque DESC
    LIMIT 1
  `;

  db.query(sqlBuscaEstoque, [IdProduto], (err, resultados) => {
    if (err) {
      console.error("❌ Erro ao consultar estoque:", err);
      return res.status(500).send("Erro ao consultar estoque.");
    }

    const existeEstoque = resultados.length > 0;

    if (!existeEstoque) {
      return res.status(400).send("Produto sem estoque disponível.");
    }

    const estoqueAtual = resultados[0];
    const quantidadeAnterior = parseInt(estoqueAtual.Quantidade) || 0;
    const precoTotalAnterior = parseFloat(estoqueAtual.PrecoTotal) || 0;

    const qtdRemover = parseInt(Quantidade);
    if (qtdRemover <= 0) {
      return res.status(400).send("Quantidade inválida.");
    }

    if (qtdRemover > quantidadeAnterior) {
      return res.status(400).send("Quantidade de saída maior que o estoque disponível.");
    }

    // valor unitário: preferir o enviado; se não vier, calcular média
    let valorUnit = parseFloat(ValorUnitario);
    if (!valorUnit || isNaN(valorUnit)) {
      // evita divisão por zero
      valorUnit = quantidadeAnterior > 0 ? precoTotalAnterior / quantidadeAnterior : 0;
    }

    const quantidadeNova = quantidadeAnterior - qtdRemover;
    let precoTotalNovo = precoTotalAnterior - (qtdRemover * valorUnit);
    if (precoTotalNovo < 0) precoTotalNovo = 0;

    // Atualiza estoque (mantendo mesma lógica: atualiza último IdEstoque)
    const sqlUpdateEstoque = `
      UPDATE Estoque
      SET Quantidade = ?, PrecoTotal = ?, DataEntrada = ?, NF = ?, 
          Descricao = ?, IdTipoEntrada = ?, IdAlteracaoUsu = ?, DtAlteracao = NOW()
      WHERE IdEstoque = ?
    `;

    // Observação: mantive os campos DcNome iguais ao insert/update anterior,
    // IdTipoEntrada está sendo usado (nome da coluna original). Se no seu DB
    // a coluna para tipo de saída tem outro nome, ajuste aqui.
    db.query(
      sqlUpdateEstoque,
      [
        quantidadeNova,
        precoTotalNovo,
        dataSaidaFormatada,
        Documento || null,
        Observacoes || null,
        IdTipoSaida,
        userId,
        estoqueAtual.IdEstoque
      ],
      (err) => {
        if (err) {
          console.error("❌ Erro ao atualizar estoque:", err);
          return res.status(500).send("Erro ao atualizar estoque.");
        }

        // Registrar histórico
        const sqlHist = `
          INSERT INTO EstoqueHist (
            IdEstoqueFK, IdProdutoFK, QuantidadeAnterior, QuantidadeNova,
            DiferencaQuantidade, PrecoTotalAnterior, PrecoTotalNovo,
            TipoMovimento, IdTipoEntrada, NF, Descricao,
            IdUsuarioMovimento, DtMovimento,
            IdCadastroUsu, DtCadastro, CdStatus
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 'SAIDA', ?, ?, ?, ?, NOW(), ?, NOW(), 1)
        `;

        db.query(
          sqlHist,
          [
            estoqueAtual.IdEstoque,
            IdProduto,
            quantidadeAnterior,
            quantidadeNova,
            quantidadeNova - quantidadeAnterior,
            precoTotalAnterior,
            precoTotalNovo,
            IdTipoSaida,
            Documento || null,
            Observacoes || null,
            userId,
            userId
          ],
          (err) => {
            if (err) {
              console.error("❌ Erro ao inserir histórico de estoque:", err);
              return res.status(500).send("Erro ao inserir histórico de estoque.");
            }

            return res.status(201).json({ mensagem: "Saída registrada com sucesso!" });
          }
        );
      }
    );
  });
});

// Endpoint para popular dropdown de tipos de saída
app.get("/tipoSaidaDDL", requireAuth, (req, res) => {
  db.query("SELECT * FROM TipoSaida WHERE CdStatus = 1", (err, rows) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ error: "Erro interno" });
    }
    res.json(rows);
  });
});



// ============================
// LISTAR USUARIOS
// ============================

app.get("/usuarios", requireAuth, (req, res) => {
  const nome = req.query.nome ? String(req.query.nome).trim() : "";
  const status = req.query.status ? String(req.query.status).trim().toLowerCase() : "todos";
  const idPerfil = req.query.idPerfil ? String(req.query.idPerfil).trim() : "";

  let sql = "SELECT * FROM Usuario";
  const params = [];
  const where = []; // removida anotação TypeScript que quebrou o JS

  if (nome) {
    where.push("NomeUsuario LIKE ?");
    params.push(`%${nome}%`);
  }

  // Aplica filtro por IdPerfil se fornecido e diferente de '0' (ou string vazia)
  if (idPerfil && idPerfil !== "0") {
    // se perfil for numérico, converte para número; caso contrário, usa como string
    const perfilNum = Number(idPerfil);
    if (!Number.isNaN(perfilNum)) {
      where.push("IdPerfil = ?");
      params.push(perfilNum);
    } else {
      // fallback caso o cliente envie nome de perfil em vez do id
      where.push("IdPerfil = ?");
      params.push(idPerfil);
    }
  }

  if (status && status !== "todos") {
    let cdStatus;
    if (status === "ativo" || status === "1") cdStatus = 1;
    else if (status === "inativo" || status === "0") cdStatus = 0;

    if (typeof cdStatus !== "undefined") {
      where.push("CdStatus = ?");
      params.push(cdStatus);
    }
  }

  if (where.length) {
    sql += " WHERE " + where.join(" AND ");
  }

  console.log("Query Usuario:", sql, params);
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erro MySQL ao buscar usuários:", err);
      return res.status(500).json({
        error: "Erro ao buscar usuários",
        details: err.message,
      });
    }
    else {
      res.json(results);
    }
  });
});

app.post("/usuarios", requireAuth, (req, res) => {
  const { NomeUsuario, Senha_hash, IdPerfil, CdStatus } = req.body;

  console.log("Dados recebidos para novo usuário:", req.body); // Mude para req.body

  // VALIDAÇÃO (muito importante)
  if (!NomeUsuario) {
    console.error("Erro: Nome do usuário é obrigatório!");
    return res.status(400).json({ error: "Nome do usuário é obrigatório" });
  }

  const query = "INSERT INTO Usuario (NomeUsuario, Senha_hash, IdPerfil, IdCadastroUsu, DtCadastro, IdAlteracaoUsu, DtAlteracao, IdCCancelamentoUsu, DtCancelamento, CdStatus) VALUES (?, ?, ?, 1, NOW(), NULL, NULL, NULL, NULL, ?)";
  
  db.query(query, [NomeUsuario, Senha_hash, IdPerfil, CdStatus], (err, results) => {
    if (err) {
      console.error("Erro ao criar usuário:", err);
      res.status(500).send("Erro ao criar usuário");
    } else {
      // CORREÇÃO: Use as variáveis que você definiu
      const newUser = {
        id: results.insertId,
        NomeUsuario,      // Use NomeUsuario (não 'nome')
        Senha_hash,       // Use Senha_hash (não 'senha')
        IdPerfil,         // Use IdPerfil (não 'perfil')
        CdStatus
      };
      res.status(201).json(newUser);
    }
  });
});

app.put("/usuarios/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { NomeUsuario, Senha_hash, IdPerfil, CdStatus } = req.body;
  debugger
  
  // Validações básicas (senha é opcional no update)
  if (!NomeUsuario || !IdPerfil || CdStatus === undefined) {
    return res.status(400).json({ error: "Nome de usuário, perfil e status são obrigatórios" });
  }

  let query, params;

  // Se a senha foi fornecida, atualiza também a senha
  if (Senha_hash) {
    query = "UPDATE Usuario SET NomeUsuario = ?, Senha_hash = ?, IdPerfil = ?, CdStatus = ?, IdAlteracaoUsu = 1, DtAlteracao = NOW() WHERE IdUsuario = ?";
    params = [NomeUsuario, Senha_hash, IdPerfil, CdStatus, id];
  } else {
    // Se não foi fornecida senha, mantém a senha atual
    query = "UPDATE Usuario SET NomeUsuario = ?, IdPerfil = ?, CdStatus = ?, IdAlteracaoUsu = 1, DtAlteracao = NOW() WHERE IdUsuario = ?";
    params = [NomeUsuario, IdPerfil, CdStatus, id];
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Erro ao atualizar usuário:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    } else {
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      const updatedUser = {
        IdUsuario: parseInt(id),
        NomeUsuario,
        IdPerfil,
        CdStatus
      };
      // Só inclui a senha no response se foi atualizada
      if (Senha_hash) {
        updatedUser.Senha_hash = Senha_hash;
      }
      res.status(200).json(updatedUser);
    }
  });
});

app.get("/perfisDDL", requireAuth, (req, res) => {
  db.query("SELECT * FROM Perfis WHERE CdStatus = 1", (err, rows) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ error: "Erro interno" });
    }
    res.json(rows);
  });
});

// ============================
// PERFIS 
// ============================
app.get("/perfis", requireAuth, (req, res) => {
  const nome = req.query.nome ? String(req.query.nome).trim() : "";
  const status = req.query.status ? String(req.query.status).trim().toLowerCase() : "todos";

  let sql = "SELECT * FROM Perfis";
  const params = [];
  const where = []; // removida anotação TypeScript que quebrou o JS

  if (nome) {
    where.push("NomePerfil LIKE ?");
    params.push(`%${nome}%`);
  }

  if (status && status !== "todos") {
    let cdStatus;
    if (status === "ativo" || status === "1") cdStatus = 1;
    else if (status === "inativo" || status === "0") cdStatus = 0;

    if (typeof cdStatus !== "undefined") {
      where.push("CdStatus = ?");
      params.push(cdStatus);
    }
  }

  if (where.length) {
    sql += " WHERE " + where.join(" AND ");
  }

  console.log("Query perfis:", sql, params);
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erro MySQL ao buscar perfis:", err);
      return res.status(500).json({
        error: "Erro ao buscar perfis",
        details: err.message,
      });
    }
    else {
      res.json(results);
    }
  });
});

app.post("/perfis", requireAuth, (req, res) => {
  const { nome, status } = req.body;
  
  if (!nome || !status) {
    return res.status(400).send("Todos os campos são obrigatórios");
  }

  // CORREÇÃO: Valores ajustados conforme sua especificação
  const query = "INSERT INTO Perfis (NomePerfil, IdCadastroUsu, DtCadastro, IdAlteracaoUsu, DtAlteracao, IdCCancelamentoUsu, DtCancelamento, CdStatus) VALUES (?, 1, NOW(), NULL, NULL, NULL, NULL, ?)";
  
  db.query(query, [nome, status], (err, results) => {
    if (err) {
      console.error("Erro ao criar perfil:", err);
      res.status(500).send("Erro ao criar perfil");
    } else {
      const newPerfil = {
        id: results.insertId,
        nome,
        status
      };
      res.status(201).json(newPerfil);
    }
  });
});

app.put("/perfis/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { NomePerfil, CdStatus } = req.body;
  debugger
  
  // CORREÇÃO: Verificar se os campos existem no body
  if (!NomePerfil || CdStatus === undefined || CdStatus === null) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const query = "UPDATE Perfis SET NomePerfil = ?, CdStatus = ?, IdAlteracaoUsu = 1, DtAlteracao = NOW() WHERE IdPerfil = ?";
  
  db.query(query, [NomePerfil, CdStatus, id], (err, results) => {
    if (err) {
      console.error("Erro ao atualizar perfil:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    } else {
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Perfil não encontrado" });
      }
      
      const updatedPerfil = {
        IdPerfil: parseInt(id),
        NomePerfil,
        CdStatus
      };
      res.status(200).json(updatedPerfil);
    }
  });
});

// =========================
// PROGRAMA X PERFIL
// =========================

// LISTAR TODOS OS PERFIS (menos Admin)
app.get("/perfisPXP", requireAuth, (req, res) => {
    const sql = `
        SELECT * FROM Perfis
        WHERE CdStatus = 1 AND NomePerfil <> 'Administrador'
    `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(rows);
    });
});

// LISTAR TODOS OS PROGRAMAS
app.get("/programasPXP", requireAuth, (req, res) => {
    const sql = `
        SELECT IdPrograma, NomePrograma, Title
        FROM Programa
        WHERE CdStatus = 1
    `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(rows);
    });
});

// LISTAR PROGRAMAS ASSOCIADOS A UM PERFIL
app.get("/programas-perfilPXP/:idPerfil", requireAuth, (req, res) => {
    const { idPerfil } = req.params;

    const sql = `
        SELECT IdPrograma
        FROM ProgramaXPerfil
        WHERE IdPerfil = ? AND CdStatus = 1
    `;

    db.query(sql, [idPerfil], (err, rows) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(rows.map(r => r.IdPrograma));
    });
});

// SALVAR VÍNCULOS (REGRAVA TUDO)
app.post("/programas-perfilPXP", requireAuth, (req, res) => {
    const { IdPerfil, Programas } = req.body;
    const userId = req.session.userId;

    if (!IdPerfil)
        return res.status(400).json({ erro: "IdPerfil obrigatório" });

    // 1) Remove todos os vínculos ativos
    const deleteSql = `
        UPDATE ProgramaXPerfil
        SET CdStatus = 0, DtCancelamento = NOW(), IdCCancelamentoUsu = ?
        WHERE IdPerfil = ? AND CdStatus = 1
    `;

    db.query(deleteSql, [userId, IdPerfil], (err) => {
        if (err) return res.status(500).json({ erro: err });

        if (!Programas || Programas.length === 0) {
            return res.json({ sucesso: true, msg: "Vínculos removidos" });
        }

        // 2) Insere novos vínculos
        const insertSql = `
            INSERT INTO ProgramaXPerfil 
            (IdPrograma, IdPerfil, IdCadastroUsu, DtCadastro, CdStatus)
            VALUES ?
        `;

        const values = Programas.map(p => [
            p, IdPerfil, userId, new Date(), 1
        ]);

        db.query(insertSql, [values], (err2) => {
            if (err2) return res.status(500).json({ erro: err2 });

            res.json({ sucesso: true, msg: "Vínculos atualizados" });
        });
    });
});






// ======================================
// RELATÓRIOS
// ======================================

app.get("/relatorios/movimentacoes", requireAuth, (req, res) => {
  const dataInicial = req.query.dataInicial || req.query.dataInicio || null;
  const dataFinal = req.query.dataFinal || req.query.dataFim || null;
  const tipo = req.query.tipo ? String(req.query.tipo).toUpperCase() : "TODOS";

  let sql = `
    SELECT 
      EH.IdEstoqueHist,
      EH.TipoMovimento,
      EH.QuantidadeAnterior,
      EH.QuantidadeNova,
      EH.DiferencaQuantidade,
      EH.PrecoTotalAnterior,
      EH.PrecoTotalNovo,
      EH.NF,
      EH.Descricao,
      EH.DtMovimento,
      P.NomeProduto,
      U.NomeUsuario AS Responsavel
    FROM EstoqueHist EH
    LEFT JOIN Produto P ON P.IdProduto = EH.IdProdutoFK
    LEFT JOIN Usuario U ON U.IdUsuario = EH.IdUsuarioMovimento
  `;

  const params = [];
  const where = [];

  // FILTRO - DATA INICIAL
  if (dataInicial) {
    where.push("EH.DtMovimento >= ?");
    params.push(`${dataInicial} 00:00:00`);
  }

  console.log("Data Final recebida:", dataFinal);

  // FILTRO - DATA FINAL
  if (dataFinal) {
    where.push("EH.DtMovimento <= ?");
    params.push(`${dataFinal} 23:59:59`);
  }

  console.log("Tipo de movimento recebido:", tipo);

  // FILTRO - TIPO DE MOVIMENTO
  if (tipo !== "TODOS") {
    where.push("EH.TipoMovimento = ?");
    params.push(tipo);
  }

  // SE EXISTEM FILTROS -> adiciona WHERE
  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }

  // ORDENAR por data desc
  sql += " ORDER BY EH.DtMovimento DESC";

  console.log("Query Movimentações:", sql, params);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erro MySQL ao buscar movimentações:", err);
      return res.status(500).json({
        error: "Erro ao buscar movimentações",
        details: err.message,
      });
    }

    // SEMPRE retornar ARRAY
    return res.json(Array.isArray(results) ? results : []);
  });
});


// ======================================
// DASHBOARD
// ======================================

app.get("/dashboard", requireAuth, (req, res) => {
  const sqlResumo = `
    SELECT 
      -- Total de produtos ativos
      (SELECT COUNT(*) FROM Produto WHERE CdStatus = 1) AS totalProdutos,

      -- Produtos com estoque > 0 (contagem via Estoque)
      (SELECT COUNT(*)
       FROM Estoque E
       JOIN Produto P ON P.IdProduto = E.IdProduto
       WHERE E.Quantidade > 0 AND (P.CdStatus IS NULL OR P.CdStatus = 1)
      ) AS estoqueNormal,

      -- Estoque baixo (<= EstMinimo e > 0)
      (SELECT COUNT(*)
       FROM Estoque E
       JOIN Produto P ON P.IdProduto = E.IdProduto
       WHERE E.Quantidade <= P.EstMinimo AND E.Quantidade > 0 AND (P.CdStatus IS NULL OR P.CdStatus = 1)
      ) AS estoqueBaixo,

      -- Sem estoque
      (SELECT COUNT(*)
       FROM Estoque E
       JOIN Produto P ON P.IdProduto = E.IdProduto
       WHERE E.Quantidade = 0 AND (P.CdStatus IS NULL OR P.CdStatus = 1)
      ) AS semEstoque,

      -- Entradas no mês corrente (quantidade)
      (SELECT SUM(CASE WHEN TipoMovimento = 'ENTRADA' THEN DiferencaQuantidade ELSE 0 END)
       FROM EstoqueHist
       WHERE MONTH(DtMovimento) = MONTH(CURRENT_DATE()) AND YEAR(DtMovimento) = YEAR(CURRENT_DATE())
      ) AS entradasMes,

      -- Saídas no mês corrente (quantidade)
      (SELECT SUM(CASE WHEN TipoMovimento = 'SAIDA' THEN ABS(DiferencaQuantidade) ELSE 0 END)
       FROM EstoqueHist
       WHERE MONTH(DtMovimento) = MONTH(CURRENT_DATE()) AND YEAR(DtMovimento) = YEAR(CURRENT_DATE())
      ) AS saidasMes,

      -- Valor total atual em estoque (Quantidade * Preco)
      (SELECT SUM(E.Quantidade * P.Preco)
       FROM Estoque E
       JOIN Produto P ON P.IdProduto = E.IdProduto
       WHERE (P.CdStatus IS NULL OR P.CdStatus = 1)
      ) AS valorTotalEstoque,

      -- Valor total das saídas do mês (R$) = SUM(|DiferencaQuantidade| * Preco) para TipoMovimento = 'SAIDA'
      (SELECT SUM(ABS(H.DiferencaQuantidade) * P.Preco)
       FROM EstoqueHist H
       JOIN Produto P ON P.IdProduto = H.IdProdutoFK
       WHERE H.TipoMovimento = 'SAIDA'
         AND MONTH(H.DtMovimento) = MONTH(CURRENT_DATE())
         AND YEAR(H.DtMovimento) = YEAR(CURRENT_DATE())
      ) AS valorTotalSaidasMes
  `;

  const sqlMovMensal = `
    SELECT 
      MONTH(DtMovimento) AS mesNum,
      DATE_FORMAT(DtMovimento, '%b') AS mes,
      SUM(CASE WHEN TipoMovimento='ENTRADA' THEN DiferencaQuantidade ELSE 0 END) AS entrada,
      SUM(CASE WHEN TipoMovimento='SAIDA' THEN ABS(DiferencaQuantidade) ELSE 0 END) AS saida
    FROM EstoqueHist
    WHERE YEAR(DtMovimento) = YEAR(CURRENT_DATE())
    GROUP BY MONTH(DtMovimento)
    ORDER BY MONTH(DtMovimento)
  `;

  db.query(sqlResumo, (err, resumoResult) => {
    if (err) {
      console.error("Erro no resumo:", err);
      return res.status(500).json({ error: "Erro ao carregar resumo do dashboard." });
    }

    const resumo = resumoResult && resumoResult[0] ? resumoResult[0] : {};

    // Se algum valor for NULL, converta para 0
    resumo.totalProdutos = resumo.totalProdutos || 0;
    resumo.estoqueNormal = resumo.estoqueNormal || 0;
    resumo.estoqueBaixo = resumo.estoqueBaixo || 0;
    resumo.semEstoque = resumo.semEstoque || 0;
    resumo.entradasMes = resumo.entradasMes || 0;
    resumo.saidasMes = resumo.saidasMes || 0;
    resumo.valorTotalEstoque = resumo.valorTotalEstoque || 0;
    resumo.valorTotalSaidasMes = resumo.valorTotalSaidasMes || 0;

    db.query(sqlMovMensal, (err2, movimentacoes) => {
      if (err2) {
        console.error("Erro nas movimentações:", err2);
        return res.status(500).json({ error: "Erro ao carregar movimentações mensais." });
      }

      // padroniza meses: garantir que teremos os 12 meses (opcional)
      // Aqui retornamos só os meses existentes no ano corrente
      const estoque = [
        { name: "Em Estoque", value: resumo.estoqueNormal },
        { name: "Estoque Baixo", value: resumo.estoqueBaixo },
        { name: "Sem Estoque", value: resumo.semEstoque },
      ];

      return res.json({
        resumo,
        movimentacoes,
        estoque,
      });
    });
  });
});





// ============================
// INICIAR SERVIDOR
// ============================
app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
  console.log("CORS configurado para: http://localhost:8080");
  console.log("Sessions habilitadas");
});