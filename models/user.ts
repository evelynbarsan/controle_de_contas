import { getPool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface User {
  id          : number;
  nome        : string;
  email       : string;
  senha_hash  : string;
}

// Busca usuário pelo e-mail (usado no login)
export async function findByEmail(email: string): Promise<User | null> {
  const [rows] = await getPool().execute<RowDataPacket[]>(
    "SELECT id, nome, email, senha_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return (rows[0] as User) ?? null;
}
