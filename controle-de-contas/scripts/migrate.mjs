// scripts/migrate.mjs
// Runner de migrations — rastreia arquivos aplicados em `_migrations` no MySQL
import fs   from "fs";
import path from "path";
import { createConnection } from "mysql2/promise";
import { fileURLToPath }    from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Lê variáveis do .env apenas se ainda não estiverem em process.env ─────────
// Em Docker as variáveis já chegam via env_file do docker-compose; o .env é
// usado apenas quando rodando fora do container (desenvolvimento local).
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return; // dentro do container: sem .env, tudo bem
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && !(key in process.env)) process.env[key] = rest.join("=");
  }
}

// ── Aguarda o MySQL ficar disponível (útil no startup do Docker) ──────────────
async function waitForDb(config, { retries = 15, delayMs = 4000 } = {}) {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await createConnection(config);
      await conn.end();
      return;
    } catch (err) {
      console.log(`  Aguardando banco de dados... (tentativa ${i}/${retries}): ${err.message}`);
      if (i === retries) throw new Error("Banco de dados não disponível após múltiplas tentativas.");
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function main() {
  loadEnv();

  const dbConfig = {
    host    : process.env.DB_HOST     ?? "127.0.0.1",
    port    : Number(process.env.DB_PORT ?? 3306),
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };

  await waitForDb(dbConfig);

  const conn = await createConnection(dbConfig);

  // Tabela de controle — registra quais migrations já foram aplicadas
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows]   = await conn.execute("SELECT name FROM _migrations");
  const applied  = new Set(rows.map((r) => r.name));

  const migrDir  = path.resolve(__dirname, "../migrations");
  if (!fs.existsSync(migrDir)) fs.mkdirSync(migrDir, { recursive: true });

  const files = fs
    .readdirSync(migrDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ✔ já aplicada: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrDir, file), "utf8");
    console.log(`  → aplicando:   ${file}`);

    // Divide o arquivo em statements individuais (suporte a múltiplos CREATE/INSERT por arquivo)
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      await conn.query(stmt);
    }

    await conn.execute("INSERT INTO _migrations (name) VALUES (?)", [file]);
    ran++;
  }

  await conn.end();
  console.log(`\nMigrations concluídas: ${ran} nova(s) aplicada(s).`);
}

main().catch((err) => {
  console.error("Erro na migration:", err.message);
  process.exit(1);
});
