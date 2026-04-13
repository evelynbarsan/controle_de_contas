"use server";

import { z }              from "zod";
import { getPool }        from "@/lib/db";
import { getSession }     from "@/lib/session";
import { criarTipoConta, criarFonte } from "@/models/lookup";
import { revalidatePath } from "next/cache";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

const ContaSchema = z.object({
  titulo           : z.string().min(1, "Título obrigatório").max(255),
  data_contratacao : z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  modalidade       : z.enum(["compra", "divida", "refinanciamento", "investimento", "emprestimo", "plano", "pagamento"]),
  fonte_id        : z.coerce.number().int().min(0).default(0),
  frequencia_id   : z.coerce.number().int().positive("Frequência obrigatória"),
  // num_parcelas: 0 = fixo (sem fim), ≥1 = parcelado
  num_parcelas    : z.coerce.number().int().min(0).default(1),
  valor_total     : z.coerce.number().positive("Valor total deve ser positivo"),
  valor_unitario  : z.coerce.number().positive("Valor da parcela deve ser positivo"),
  valor_original  : z.coerce.number().positive().optional().or(z.literal("")).transform(v => v === "" ? undefined : v),
  inicio_pagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início inválida"),
  fim_pagamento   : z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  observacao      : z.string().max(1000).optional(),
});

export type ContaActionState = { error?: string; success?: boolean };

export async function criarContaAction(
  _prev    : ContaActionState,
  formData : FormData,
): Promise<ContaActionState> {
  const session = await getSession();
  if (!session.loggedIn) return { error: "Não autenticado" };

  // ── Resolve tipo_conta_id ─────────────────────────────────────────────────
  const tcIdRaw  = (formData.get("tipo_conta_id")    ?? "") as string;
  const tcCustom = ((formData.get("tipo_conta_custom") ?? "") as string).trim();
  let tipo_conta_id: number;
  if (/^\d+$/.test(tcIdRaw) && parseInt(tcIdRaw) > 0) {
    tipo_conta_id = parseInt(tcIdRaw, 10);
  } else if (tcCustom) {
    tipo_conta_id = await criarTipoConta(tcCustom);
  } else {
    return { error: "Tipo de conta obrigatório" };
  }

  // ── Resolve fonte_id ──────────────────────────────────────────────────────
  const fIdRaw   = (formData.get("fonte_id")     ?? "") as string;
  const fCustom  = ((formData.get("fonte_custom") ?? "") as string).trim();
  let fonte_id: number;
  if (/^\d+$/.test(fIdRaw) && parseInt(fIdRaw) > 0) {
    fonte_id = parseInt(fIdRaw, 10);
  } else if (fCustom) {
    fonte_id = await criarFonte(fCustom);
  } else {
    return { error: "Fonte obrigatória" };
  }

  // ── Valida demais campos com Zod ──────────────────────────────────────────
  const parsed = ContaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const d = parsed.data;

  await getPool().execute(
    `INSERT INTO contas
       (usuario_id, titulo, data_contratacao, modalidade, tipo_conta_id, fonte_id, frequencia_id,
        num_parcelas, valor_total, valor_unitario, inicio_pagamento, fim_pagamento,
        valor_original, observacao)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.userId, d.titulo, d.data_contratacao || null, d.modalidade,
      tipo_conta_id, fonte_id, d.frequencia_id,
      d.num_parcelas, d.valor_total, d.valor_unitario,
      d.inicio_pagamento, d.fim_pagamento || null,
      (d.valor_original as number | undefined) ?? null, d.observacao || null,
    ],
  );

  revalidatePath("/dashboard");
  return { success: true };
}

// ── Editar conta ──────────────────────────────────────────────────────────────
export async function editarContaAction(
  _prev   : ContaActionState,
  formData: FormData,
): Promise<ContaActionState> {
  const session = await getSession();
  if (!session.loggedIn) return { error: "Não autenticado" };

  const id = parseInt(String(formData.get("id") ?? ""), 10);
  if (!id || isNaN(id)) return { error: "ID inválido" };

  const pool = getPool();

  // ── Resolve tipo_conta_id ────────────────────────────────────────────────
  const tcIdRaw  = (formData.get("tipo_conta_id")    ?? "") as string;
  const tcCustom = ((formData.get("tipo_conta_custom") ?? "") as string).trim();
  let tipo_conta_id: number;
  if (/^\d+$/.test(tcIdRaw) && parseInt(tcIdRaw) > 0) {
    tipo_conta_id = parseInt(tcIdRaw, 10);
  } else if (tcCustom) {
    tipo_conta_id = await criarTipoConta(tcCustom);
  } else {
    return { error: "Tipo de conta obrigatório" };
  }

  // ── Resolve fonte_id ─────────────────────────────────────────────────────
  const fIdRaw  = (formData.get("fonte_id")     ?? "") as string;
  const fCustom = ((formData.get("fonte_custom") ?? "") as string).trim();
  let fonte_id: number;
  if (/^\d+$/.test(fIdRaw) && parseInt(fIdRaw) > 0) {
    fonte_id = parseInt(fIdRaw, 10);
  } else if (fCustom) {
    fonte_id = await criarFonte(fCustom);
  } else {
    return { error: "Fonte obrigatória" };
  }

  const parsed = ContaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  // ── Verifica conta original para split temporal (gastos fixos) ───────────
  const viewYear  = parseInt(String(formData.get("view_year")  ?? "0"), 10);
  const viewMonth = parseInt(String(formData.get("view_month") ?? "0"), 10);

  const [origRows] = await pool.execute<(RowDataPacket & { num_parcelas: number; inicio_pagamento: string })[]>(
    "SELECT num_parcelas, DATE_FORMAT(inicio_pagamento, '%Y-%m-%d') AS inicio_pagamento FROM contas WHERE id = ? AND usuario_id = ?",
    [id, session.userId],
  );
  const orig = origRows[0];

  if (orig?.num_parcelas === 0 && viewYear && viewMonth) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const viewStart = `${viewYear}-${pad(viewMonth)}-01`;

    if (orig.inicio_pagamento < viewStart) {
      // Split: fecha o original no fim do mês anterior e cria novo a partir deste mês
      await pool.execute(
        "UPDATE contas SET fim_pagamento = DATE_SUB(?, INTERVAL 1 DAY) WHERE id = ? AND usuario_id = ?",
        [viewStart, id, session.userId],
      );
      await pool.execute(
        `INSERT INTO contas
           (usuario_id, titulo, data_contratacao, modalidade, tipo_conta_id, fonte_id, frequencia_id,
            num_parcelas, valor_total, valor_unitario, inicio_pagamento, fim_pagamento,
            valor_original, observacao)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.userId, d.titulo, d.data_contratacao || null, d.modalidade,
          tipo_conta_id, fonte_id, d.frequencia_id,
          0, d.valor_total, d.valor_unitario,
          viewStart, null,
          (d.valor_original as number | undefined) ?? null, d.observacao || null,
        ],
      );
      revalidatePath("/dashboard");
      return { success: true };
    }
  }

  // Não é fixo (ou início é neste mês/futuro): UPDATE normal
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE contas SET
       titulo=?, data_contratacao=?, modalidade=?, tipo_conta_id=?, fonte_id=?,
       frequencia_id=?, num_parcelas=?, valor_total=?, valor_unitario=?,
       inicio_pagamento=?, fim_pagamento=?, valor_original=?, observacao=?
     WHERE id=? AND usuario_id=?`,
    [
      d.titulo, d.data_contratacao || null, d.modalidade,
      tipo_conta_id, fonte_id, d.frequencia_id,
      d.num_parcelas, d.valor_total, d.valor_unitario,
      d.inicio_pagamento, d.fim_pagamento || null,
      (d.valor_original as number | undefined) ?? null, d.observacao || null,
      id, session.userId,
    ],
  );

  if (result.affectedRows === 0) return { error: "Conta não encontrada" };
  revalidatePath("/dashboard");
  return { success: true };
}

// ── Marcar como pago ──────────────────────────────────────────────────────────
export async function marcarPagoAction(
  contaId  : number,
  year     : number,
  month    : number,
  valorPago: number,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session.loggedIn) return { error: "Não autenticado" };

  const pool = getPool();

  // Verifica se a conta pertence ao usuário
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM contas WHERE id = ? AND usuario_id = ?",
    [contaId, session.userId],
  );
  if (!rows[0]) return { error: "Conta não encontrada" };

  // INSERT IGNORE respeita a UNIQUE KEY (conta_id, ano, mes)
  await pool.execute(
    `INSERT IGNORE INTO pagamentos (conta_id, ano, mes, valor_pago, num_parcelas_pagas)
     VALUES (?, ?, ?, ?, 1)`,
    [contaId, year, month, valorPago],
  );

  revalidatePath("/dashboard");
  return {};
}

// ── Desmarcar como pago ───────────────────────────────────────────────────────
export async function desmarcarPagoAction(
  pagamentoId: number,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session.loggedIn) return { error: "Não autenticado" };

  // DELETE apenas se o pagamento pertence a uma conta do usuário
  await getPool().execute(
    `DELETE p FROM pagamentos p
     JOIN contas c ON c.id = p.conta_id
     WHERE p.id = ? AND c.usuario_id = ?`,
    [pagamentoId, session.userId],
  );

  revalidatePath("/dashboard");
  return {};
}

// ── Excluir conta ─────────────────────────────────────────────────────────────
export async function excluirContaAction(
  id   : number,
  year ?: number,
  month?: number,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session.loggedIn) return { error: "Não autenticado" };

  const pool = getPool();

  if (year && month) {
    const [rows] = await pool.execute<(RowDataPacket & { num_parcelas: number; inicio_pagamento: string })[]>(
      "SELECT num_parcelas, DATE_FORMAT(inicio_pagamento, '%Y-%m-%d') AS inicio_pagamento FROM contas WHERE id = ? AND usuario_id = ?",
      [id, session.userId],
    );
    const orig = rows[0];

    if (orig?.num_parcelas === 0) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const viewStart = `${year}-${pad(month)}-01`;

      if (orig.inicio_pagamento < viewStart) {
        // Fecha no fim do mês anterior — não apaga meses passados
        await pool.execute(
          "UPDATE contas SET fim_pagamento = DATE_SUB(?, INTERVAL 1 DAY) WHERE id = ? AND usuario_id = ?",
          [viewStart, id, session.userId],
        );
        revalidatePath("/dashboard");
        return {};
      }
    }
  }

  await pool.execute("DELETE FROM contas WHERE id = ? AND usuario_id = ?", [id, session.userId]);
  revalidatePath("/dashboard");
  return {};
}

