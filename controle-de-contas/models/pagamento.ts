import { getPool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface Pagamento {
  id                : number;
  conta_id          : number;
  ano               : number;
  mes               : number;
  valor_pago        : number;
  num_parcelas_pagas: number;
}

export async function getPagamentosDoMes(
  userId: number,
  year  : number,
  month : number,
): Promise<Pagamento[]> {
  const [rows] = await getPool().execute<(Pagamento & RowDataPacket)[]>(
    `SELECT p.id, p.conta_id, p.ano, p.mes,
            p.valor_pago + 0 AS valor_pago,
            p.num_parcelas_pagas
     FROM pagamentos p
     JOIN contas c ON c.id = p.conta_id
     WHERE c.usuario_id = ? AND p.ano = ? AND p.mes = ?`,
    [userId, year, month],
  );
  return rows;
}
