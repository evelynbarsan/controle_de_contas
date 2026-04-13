"use client";

import { useTransition } from "react";
import type { ContaWithJoins } from "@/models/conta";
import type { LookupItem } from "@/models/lookup";
import type { Pagamento }     from "@/models/pagamento";
import { excluirContaAction, marcarPagoAction, desmarcarPagoAction } from "../actions";
import { EditarContaModal } from "./EditarContaModal";

export interface FonteGroup {
  nome    : string;
  contas  : ContaWithJoins[];
  subtotal: number;
}

const brl = (v: number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MODALIDADE: Record<string, string> = {
  compra         : "Compra",
  divida         : "Dívida",
  refinanciamento: "Refinanciamento",
  emprestimo     : "Empréstimo",
  investimento   : "Investimento",
  plano          : "Plano",
  pagamento      : "Pagamento",
};

// ── Botão excluir ──────────────────────────────────────────────────────────────
function ExcluirBtn({ id, isFixed, year, month }: { id: number; isFixed: boolean; year: number; month: number }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const msg = isFixed
      ? `Remover este gasto fixo a partir de ${String(month).padStart(2, "0")}/${year}? Meses anteriores serão mantidos.`
      : "Excluir esta conta? Esta ação não pode ser desfeita.";
    if (!confirm(msg)) return;
    startTransition(async () => { await excluirContaAction(id, year, month); });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 active:bg-red-100 disabled:opacity-40"
      aria-label="Excluir conta"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    </button>
  );
}

// ── Botão pagar ────────────────────────────────────────────────────────────────
function PagarBtn({
  contaId,
  year,
  month,
  valorUnitario,
  pagamento,
}: {
  contaId      : number;
  year         : number;
  month        : number;
  valorUnitario: number;
  pagamento    : Pagamento | undefined;
}) {
  const [pending, startTransition] = useTransition();
  const pago = !!pagamento;

  function handleClick() {
    if (pago) {
      startTransition(async () => { await desmarcarPagoAction(pagamento!.id); });
    } else {
      startTransition(async () => { await marcarPagoAction(contaId, year, month, valorUnitario); });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      title={pago ? "Desmarcar pagamento" : "Marcar como pago"}
      aria-label={pago ? "Desmarcar pagamento" : "Marcar como pago"}
      className={`p-1.5 transition rounded-lg disabled:opacity-40 ${
        pago
          ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
          : "text-gray-300 hover:text-emerald-500 hover:bg-emerald-50"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
        fill={pago ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    </button>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export function MonthlyList({
  groups,
  grandTotal,
  tiposConta,
  fontes,
  frequencias,
  year,
  month,
  pagamentos,
}: {
  groups     : FonteGroup[];
  grandTotal : number;
  tiposConta : LookupItem[];
  fontes     : LookupItem[];
  frequencias: LookupItem[];
  year       : number;
  month      : number;
  pagamentos : Pagamento[];
}) {
  const pagoMap   = new Map<number, Pagamento>(pagamentos.map(p => [p.conta_id, p]));
  const totalPago = pagamentos.reduce((s, p) => s + Number(p.valor_pago), 0);
  const restante  = grandTotal - totalPago;

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-gray-400 text-sm">Nenhuma conta registrada neste mês.</p>
        <p className="text-gray-300 text-xs mt-1">Use o botão &ldquo;+ Nova Conta&rdquo; para adicionar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {groups.map((group) => {
        const groupPago = group.contas.reduce(
          (s, c) => s + (pagoMap.has(c.id) ? Number(pagoMap.get(c.id)!.valor_pago) : 0),
          0,
        );
        return (
          <div key={group.nome}>
            {/* Fonte header */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {group.nome}
              </span>
              {groupPago > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">
                  {brl(groupPago)} pago
                </span>
              )}
            </div>

            {/* Rows */}
            {group.contas.map((c) => {
              const pg   = pagoMap.get(c.id);
              const pago = !!pg;
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 border-b border-gray-50 transition-colors ${
                    pago ? "bg-emerald-50/40 hover:bg-emerald-50/70" : "hover:bg-gray-50/70"
                  }`}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${pago ? "text-gray-400 line-through" : "text-gray-800"}`}>
                      {c.titulo}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-x-2">
                      <span>{MODALIDADE[c.modalidade]}</span>
                      {c.num_parcelas === 0 && (
                        <span className="text-emerald-600 font-semibold">· Fixo</span>
                      )}
                      {c.num_parcelas > 1 && <span>· {c.num_parcelas}x</span>}
                      <span>· {c.tipo_conta_nome}</span>
                      <span>· {c.frequencia_nome}</span>
                      {c.data_contratacao && <span>· contrat. {c.data_contratacao}</span>}
                      <span>· início {c.inicio_pagamento}</span>
                    </p>
                  </div>

                  {/* Valor */}
                  <div className="text-right shrink-0">
                    {c.modalidade === "pagamento" ? (
                      <p className="text-sm font-semibold text-emerald-600">
                        − {brl(c.valor_unitario)}
                      </p>
                    ) : (
                      <p className={`text-sm font-semibold ${pago ? "text-gray-400" : "text-gray-800"}`}>
                        {brl(c.valor_unitario)}
                      </p>
                    )}
                    {c.num_parcelas === 0 && (
                      <p className="text-xs text-gray-400">/mês</p>
                    )}
                    {c.num_parcelas > 1 && (
                      <p className="text-xs text-gray-400">de {brl(c.valor_total)} total</p>
                    )}
                    {c.valor_original != null && (
                      <p className="text-xs text-amber-600 font-medium">orig. {brl(c.valor_original)}</p>
                    )}
                    {pago && (
                      <p className="text-xs text-emerald-600 font-semibold">✓ pago</p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <PagarBtn
                      contaId={c.id}
                      year={year}
                      month={month}
                      valorUnitario={Number(c.valor_unitario)}
                      pagamento={pg}
                    />
                    <EditarContaModal
                      conta={c}
                      tiposConta={tiposConta}
                      fontes={fontes}
                      frequencias={frequencias}
                      year={year}
                      month={month}
                    />
                    <ExcluirBtn id={c.id} isFixed={c.num_parcelas === 0} year={year} month={month} />
                  </div>
                </div>
              );
            })}

            {/* Fonte subtotal */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-50/50 border-b border-gray-100">
              <span className="text-xs font-medium text-blue-700">Subtotal — {group.nome}</span>
              <span className="text-sm font-bold text-blue-700">{brl(group.subtotal)}</span>
            </div>
          </div>
        );
      })}

      {/* Grand total */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gray-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-gray-300">Total do mês</span>
          <span className="text-lg sm:text-xl font-bold text-white tabular-nums">{brl(grandTotal)}</span>
        </div>
        {totalPago > 0 && (
          <div className="flex gap-4 pt-1.5 border-t border-gray-700">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Pago</p>
              <p className="text-sm font-semibold text-emerald-400 tabular-nums">{brl(totalPago)}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Restante</p>
              <p className={`text-sm font-semibold tabular-nums ${restante <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {brl(Math.max(0, restante))}
              </p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-gray-500">Progresso</p>
              <p className="text-sm font-semibold text-white tabular-nums">
                {Math.min(100, Math.round((totalPago / grandTotal) * 100))}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
