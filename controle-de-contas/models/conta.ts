import { getPool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface ContaWithJoins {
  id              : number;
  titulo          : string;
  data_contratacao: string | null;
  modalidade      : "compra" | "divida" | "refinanciamento" | "investimento" | "emprestimo" | "plano" | "pagamento";
  num_parcelas    : number;
  valor_total     : number;
  valor_unitario  : number;
  inicio_pagamento: string;
  fim_pagamento   : string | null;
  valor_original  : number | null;
  observacao      : string | null;
  fonte_id        : number;
  fonte_nome      : string;
  tipo_conta_id   : number;
  tipo_conta_nome : string;
  frequencia_id   : number;
  frequencia_nome : string;
}

export async function getMonthlyContas(
  userId: number,
  year  : number,
  month : number,
): Promise<ContaWithJoins[]> {
  const [rows] = await getPool().execute<(ContaWithJoins & RowDataPacket)[]>(
    `SELECT
       c.id,
       c.titulo,
       DATE_FORMAT(c.data_contratacao, '%Y-%m-%d') AS data_contratacao,
       c.modalidade,
       c.num_parcelas,
       c.valor_total    + 0 AS valor_total,
       c.valor_unitario + 0 AS valor_unitario,
       DATE_FORMAT(c.inicio_pagamento, '%Y-%m-%d') AS inicio_pagamento,
       DATE_FORMAT(c.fim_pagamento,    '%Y-%m-%d') AS fim_pagamento,
       c.valor_original + 0 AS valor_original,
       c.observacao,
       c.fonte_id,      f.nome  AS fonte_nome,
       c.tipo_conta_id, t.nome  AS tipo_conta_nome,
       c.frequencia_id, fr.nome AS frequencia_nome
     FROM contas c
     JOIN fonte      f  ON f.id  = c.fonte_id
     JOIN tipo_conta t  ON t.id  = c.tipo_conta_id
     JOIN frequencia fr ON fr.id = c.frequencia_id
     WHERE c.usuario_id = ?
       AND c.inicio_pagamento <= LAST_DAY(?)
       AND (c.fim_pagamento IS NULL OR c.fim_pagamento >= ?)
     ORDER BY f.nome, c.inicio_pagamento`,
    [
      userId,
      `${year}-${String(month).padStart(2, "0")}-01`,
      `${year}-${String(month).padStart(2, "0")}-01`,
    ],
  );
  return rows;
}

export async function getContaById(
  userId : number,
  contaId: number,
): Promise<ContaWithJoins | null> {
  const [rows] = await getPool().execute<(ContaWithJoins & RowDataPacket)[]>(
    `SELECT
       c.id, c.titulo,
       DATE_FORMAT(c.data_contratacao, '%Y-%m-%d') AS data_contratacao,
       c.modalidade, c.num_parcelas,
       c.valor_total    + 0 AS valor_total,
       c.valor_unitario + 0 AS valor_unitario,
       DATE_FORMAT(c.inicio_pagamento, '%Y-%m-%d') AS inicio_pagamento,
       DATE_FORMAT(c.fim_pagamento,    '%Y-%m-%d') AS fim_pagamento,
       c.valor_original + 0 AS valor_original,
       c.observacao,
       c.fonte_id,      f.nome  AS fonte_nome,
       c.tipo_conta_id, t.nome  AS tipo_conta_nome,
       c.frequencia_id, fr.nome AS frequencia_nome
     FROM contas c
     JOIN fonte      f  ON f.id  = c.fonte_id
     JOIN tipo_conta t  ON t.id  = c.tipo_conta_id
     JOIN frequencia fr ON fr.id = c.frequencia_id
     WHERE c.id = ? AND c.usuario_id = ?`,
    [contaId, userId],
  );
  return rows[0] ?? null;
}

/**
 * Soma o valor restante a pagar a partir do mês informado (inclusive).
 * Para contas parceladas: valor_unitario * parcelas restantes do mês em diante.
 * Contas fixas (num_parcelas=0) são excluídas pois não têm fim definido.
 */
export async function getDividaTotal(
  userId: number,
  year  : number,
  month : number,
): Promise<number> {
  const refDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const [rows] = await getPool().execute<(RowDataPacket & { total: number })[]>(
    `SELECT COALESCE(SUM(
       valor_unitario * (TIMESTAMPDIFF(MONTH, ?, fim_pagamento) + 1)
     ), 0) AS total
     FROM contas
     WHERE usuario_id = ?
       AND num_parcelas > 0
       AND inicio_pagamento <= LAST_DAY(?)
       AND fim_pagamento    >= ?`,
    [refDate, userId, refDate, refDate],
  );
  return Number(rows[0]?.total ?? 0);
}
