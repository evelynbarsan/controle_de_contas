// scripts/migrate-create.mjs
// Uso: node scripts/migrate-create.mjs <nome_da_migration>
// Exemplo: node scripts/migrate-create.mjs add_categoria_conta
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrDir   = path.resolve(__dirname, "../migrations");

const name = process.argv[2];
if (!name) {
  console.error("Erro: informe o nome da migration.\nExemplo: npm run migrate:create add_categoria_conta");
  process.exit(1);
}

// Sanitiza: apenas letras, números e underscore
const safeName = name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

// Descobre o próximo número sequencial
fs.mkdirSync(migrDir, { recursive: true });
const existing = fs.readdirSync(migrDir).filter((f) => f.endsWith(".sql")).sort();
const last     = existing.at(-1);
const next     = last ? String(Number(last.split("_")[0]) + 1).padStart(4, "0") : "0001";

const fileName = `${next}_${safeName}.sql`;
const filePath = path.join(migrDir, fileName);

fs.writeFileSync(filePath, `-- ${fileName}\n-- Escreva o SQL da migration abaixo:\n\n`);

console.log(`Migration criada: migrations/${fileName}`);
