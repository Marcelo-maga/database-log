const express = require("express");
const bodyParser = require("body-parser");
const Nano = require("nano");
const { faker } = require("@faker-js/faker");

const app = express();
app.use(bodyParser.json());

const couchDbUrl = "http://admin:admin@127.0.0.1:5984";
const nano = Nano(couchDbUrl);
const logsDbName = "logs";

let logsDb;
async function initDb() {
  try {
    const dbList = await nano.db.list();
    if (!dbList.includes(logsDbName)) {
      await nano.db.create(logsDbName);
    }
    logsDb = nano.use(logsDbName);
    console.log(`Banco de dados "${logsDbName}" conectado!`);
  } catch (err) {
    console.error("Erro ao inicializar o banco de dados:", err);
    process.exit(1);
  }
}

async function obterId() {
  try {
    const response = await logsDb.find({
      selector: { id_log: { $exists: true } },
      sort: [{ id_log: "desc" }],
      limit: 1,
    });

    if (response.docs.length > 0) {
      const ultimoId = response.docs[0].id_log;
      const ultimoNumero = parseInt(ultimoId.replace("LOG_", ""));
      return `LOG_${(ultimoNumero + 1).toString().padStart(4, "0")}`;
    } else {
      return "LOG_0001"; // Primeiro ID
    }
  } catch (err) {
    console.error("Erro ao obter próximo ID sequencial:", err);
    throw new Error("Erro ao consultar o banco para o próximo ID.");
  }
}

async function gerarLogs(qtd) {
  const acoes = ["login", "logout", "view_page", "click_button", "purchase"];
  const logs = [];

  for (let i = 0; i < qtd; i++) {
    logs.push({
      id_log: `LOG_${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0")}`,
      id_usuario: `USR_${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      acao: acoes[Math.floor(Math.random() * acoes.length)],
      timestamp: new Date(
        Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      detalhes: faker.lorem.sentence(),
      used: false,
    });
  }

  return logs;
}

app.get("/logs", async (req, res) => {
  try {
    // Busca logs com o campo "used" igual a false
    const result = await logsDb.find({
      selector: { used: false },
    });

    if (result.docs.length === 0) {
      return res.status(200).send({ message: "Nenhum log novo disponível." });
    }

    // Atualiza os logs encontrados para "used: true"
    const bulkUpdate = result.docs.map((doc) => ({
      ...doc,
      used: true,
    }));

    await logsDb.bulk({ docs: bulkUpdate });

    res.status(200).json(result.docs);
  } catch (err) {
    console.error("Erro ao buscar logs:", err);
    res.status(500).send({ error: "Erro ao buscar logs.", details: err });
  }
});

// Rota para criar logs sequenciais
app.get("/create/:qtd", async (req, res) => {
  const qtd = parseInt(req.params.qtd);

  if (isNaN(qtd) || qtd <= 0) {
    return res
      .status(400)
      .send({ error: "Informe um número válido de logs para criar." });
  }

  try {
    const novosLogs = await gerarLogs(qtd);
    await logsDb.bulk({ docs: novosLogs });
    res.status(201).send({
      message: `${qtd} logs criados com sucesso!`,
      logs: novosLogs,
    });
  } catch (err) {
    console.error("Erro ao criar logs:", err);
    res.status(500).send({ error: "Erro ao criar logs.", details: err });
  }
});

// Inicializa o banco de dados e inicia o servidor
(async () => {
  await initDb();

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
})();
