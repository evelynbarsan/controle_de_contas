import { getPool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface LookupItem { id: number; nome: string; }

async function fetchLookup(table: string): Promise<LookupItem[]> {
  const [rows] = await getPool().execute<(LookupItem & RowDataPacket)[]>(
    `SELECT id, nome FROM \`${table}\` ORDER BY nome`,
  );
  return rows;
}

export const getTipoConta  = (): Promise<LookupItem[]> => fetchLookup("tipo_conta");
export const getFonte      = (): Promise<LookupItem[]> => fetchLookup("fonte");
export const getFrequencia = (): Promise<LookupItem[]> => fetchLookup("frequencia");

/** Insere (INSERT IGNORE) em qualquer lookup e retorna o id. */
async function criarLookup(table: string, nome: string): Promise<number> {
  const pool = getPool();
  await pool.execute(`INSERT IGNORE INTO \`${table}\` (nome) VALUES (?)`, [nome]);
  const [rows] = await pool.execute<(LookupItem & RowDataPacket)[]>(
    `SELECT id FROM \`${table}\` WHERE nome = ?`,
    [nome],
  );
  return rows[0].id;
}

export const criarTipoConta = (nome: string) => criarLookup("tipo_conta", nome);
export const criarFonte     = (nome: string) => criarLookup("fonte",      nome);
