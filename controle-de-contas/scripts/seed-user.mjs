// scripts/seed-user.mjs
// Cria ou atualiza um usuário com senha criptografada (bcrypt).
// Uso: node scripts/seed-user.mjs <nome> <email> <senha>
// Ex:  node scripts/seed-user.mjs "João Silva" joao@email.com minhasenha123
import bcrypt          from "bcryptjs";
import { createConnection } from "mysql2/promise";
import fs              from "fs";
import path            from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && !(key in process.env)) process.env[key] = rest.join("=");
  }
}

loadEnv();

const [nome, email, senha] = process.argv.slice(2);

if (!nome || !email || !senha) {
  console.error('Uso: node scripts/seed-user.mjs "Nome" email@exemplo.com senha');
  process.exit(1);
}

if (senha.length < 6) {
  console.error("Senha deve ter ao menos 6 caracteres.");
  process.exit(1);
}

const conn = await createConnection({
  host    : process.env.DB_HOST     ?? "127.0.0.1",
  port    : Number(process.env.DB_PORT ?? 3307),  // porta mapeada no host
  user    : process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const senha_hash = await bcrypt.hash(senha, 12);

// Upsert: insere ou atualiza se o e-mail já existir
await conn.execute(
  `INSERT INTO users (nome, email, senha_hash)
   VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE nome = VALUES(nome), senha_hash = VALUES(senha_hash)`,
  [nome, email, senha_hash]
);

await conn.end();
console.log(`✔ Usuário "${nome}" <${email}> salvo com senha criptografada.`);
