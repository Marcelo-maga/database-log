const nano = require("nano");
const logs = require("../../logs_uso.json");

const couch = nano("http://admin:admin@127.0.0.1:5984");
const logsDb = couch.db.use("logs");

const inserirLogs = async () => {
  try {
    const bulkDocs = logs.map((log) => ({
      ...log,
      used: false,
    }));

    await logsDb.bulk({ docs: bulkDocs });
    console.log("Logs inseridos com sucesso!");
  } catch (err) {
    console.error("Erro ao inserir logs:", err);
  }
};

inserirLogs();
