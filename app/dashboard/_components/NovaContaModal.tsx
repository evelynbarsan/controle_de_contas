"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { criarContaAction, type ContaActionState } from "../actions";
import type { LookupItem } from "@/models/lookup";
import { ComboSelect } from "./ComboSelect";

interface Props {
  tiposConta : LookupItem[];
  fontes     : LookupItem[];
  frequencias: LookupItem[];
}

// ── Helpers de data ──────────────────────────────────────────────────────────
function addMonths(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1 + n, d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function monthsBetween(start: string, end: string): number {
  const [y1, m1] = start.split("-").map(Number);
  const [y2, m2] = end.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}
function fmt2(n: number) { return String(n).padStart(2, "0"); }
function isoToDisplay(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition";
const hintCls = "text-xs text-blue-600 mt-1 font-medium";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function NovaContaModal({ tiposConta, fontes, frequencias }: Props) {
  const [open, setOpen]                 = useState(false);
  const formRef                         = useRef<HTMLFormElement>(null);
  const [state, formAction, pending]    = useActionState<ContaActionState, FormData>(
    criarContaAction, {},
  );

  // ── State dos campos calculados ──────────────────────────────────────────
  const [valorTotal,    setValorTotal]    = useState("");
  const [valorParcela,  setValorParcela]  = useState("");
  const [numParcelas,   setNumParcelas]   = useState("1");
  const [inicio,        setInicio]        = useState("");
  const [fim,           setFim]           = useState("");
  const [ehFixo,        setEhFixo]        = useState(false);
  const [modalidade,    setModalidade]    = useState("");
  const [valorOriginal, setValorOriginal] = useState("");
  const [tipoContaText, setTipoContaText] = useState("");
  const [tipoContaId,   setTipoContaId]   = useState("");
  const [fonteText,     setFonteText]     = useState("");
  const [fonteId,       setFonteId]       = useState("");

  // Hints de auto-cálculo
  const [hintValor, setHintValor] = useState("");
  const [hintData,  setHintData]  = useState("");

  function resetModal() {
    setValorTotal(""); setValorParcela(""); setNumParcelas("1");
    setInicio(""); setFim(""); setEhFixo(false);
    setModalidade(""); setValorOriginal("");
    setTipoContaText(""); setTipoContaId("");
    setFonteText("");     setFonteId("");
    setHintValor(""); setHintData("");
    formRef.current?.reset();
  }

  useEffect(() => {
    if (state?.success) { setOpen(false); resetModal(); }
  }, [state]);

  // ── Handlers de valor ────────────────────────────────────────────────────
  function handleTotalChange(v: string) {
    setValorTotal(v);
    const vt = parseFloat(v);
    const n  = parseInt(numParcelas);
    if (!isNaN(vt) && vt > 0 && n > 0) {
      const p = (vt / n).toFixed(2);
      setValorParcela(p);
      setHintValor(n > 1 ? `→ R$ ${p} / parcela` : "");
    }
  }

  function handleParcelaChange(v: string) {
    setValorParcela(v);
    const vp = parseFloat(v);
    const n  = parseInt(numParcelas);
    if (!isNaN(vp) && vp > 0 && n > 0 && !ehFixo) {
      const t = (vp * n).toFixed(2);
      setValorTotal(t);
      setHintValor(n > 1 ? `→ total R$ ${t}` : "");
    }
  }

  function handleNumParcelasChange(v: string) {
    setNumParcelas(v);
    const n = parseInt(v);
    if (n > 0) {
      const vt = parseFloat(valorTotal);
      const vp = parseFloat(valorParcela);
      if (!isNaN(vt) && vt > 0) {
        const p = (vt / n).toFixed(2);
        setValorParcela(p);
        setHintValor(`→ R$ ${p} / parcela`);
      } else if (!isNaN(vp) && vp > 0) {
        const t = (vp * n).toFixed(2);
        setValorTotal(t);
        setHintValor(`→ total R$ ${t}`);
      }
      // Recalcula fim se início já está preenchido
      if (inicio) {
        const novoFim = n === 1 ? inicio : addMonths(inicio, n - 1);
        setFim(novoFim);
        setHintData(`→ término: ${isoToDisplay(novoFim)}`);
      }
    }
  }

  // ── Handlers de data ─────────────────────────────────────────────────────
  function handleInicioChange(v: string) {
    setInicio(v);
    if (!v) return;
    if (ehFixo) {
      if (fim) {
        const n = Math.max(1, monthsBetween(v, fim) + 1);
        setNumParcelas(String(n));
        setHintData(`→ ${n} mês(es) no total`);
      }
    } else {
      const n = parseInt(numParcelas);
      if (n > 0) {
        const novoFim = n === 1 ? v : addMonths(v, n - 1);
        setFim(novoFim);
        setHintData(`→ término: ${isoToDisplay(novoFim)}`);
      }
    }
  }

  function handleFixoFimChange(v: string) {
    setFim(v);
    if (v && inicio) {
      const n = Math.max(1, monthsBetween(inicio, v) + 1);
      setNumParcelas(String(n));
      setHintData(`→ ${n} mês(es) no total`);
    } else {
      setNumParcelas("0");
      setHintData("");
    }
  }

  function handleFimChange(v: string) {
    setFim(v);
    if (v && inicio) {
      const n     = Math.max(1, monthsBetween(inicio, v) + 1);
      setNumParcelas(String(n));
      setHintData(`→ ${n} parcela${n > 1 ? "s" : ""}`);
      const vt = parseFloat(valorTotal);
      if (!isNaN(vt) && vt > 0) {
        const p = (vt / n).toFixed(2);
        setValorParcela(p);
        setHintValor(`→ R$ ${p} / parcela`);
      }
    }
  }

  // ── Handler de frequência ────────────────────────────────────────────────
  function handleFreqChange(id: string) {
    const fr      = frequencias.find(f => String(f.id) === id);
    const isFixo  = fr?.nome.toLowerCase() === "fixo";
    setEhFixo(isFixo);
    if (isFixo) {
      if (valorTotal && !valorParcela) setValorParcela(valorTotal);
      if (valorParcela && !valorTotal) setValorTotal(valorParcela);
      if (!fim) setNumParcelas("0");
    } else {
      if (numParcelas === "0") setNumParcelas("1");
      setHintData("");
    }
  }

  // ── Handler tipo conta combobox ──────────────────────────────────────────
  function handleTipoContaChange(v: string) {
    setTipoContaText(v);
    const match = tiposConta.find(t => t.nome.toLowerCase() === v.toLowerCase());
    setTipoContaId(match ? String(match.id) : "");
  }
  // ── Handler fonte combobox ────────────────────────────────────────────
  function handleFonteChange(v: string) {
    setFonteText(v);
    const match = fontes.find(f => f.nome.toLowerCase() === v.toLowerCase());
    setFonteId(match ? String(match.id) : "");
  }
  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
      >
        <span className="text-base leading-none">+</span> Nova Conta
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

          <div
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-semibold text-gray-800">Nova Conta</h2>
              <button type="button" onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {/* Form */}
            <form ref={formRef} action={formAction} className="overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">

              {/* Inputs hidden com os valores calculados */}
              <input type="hidden" name="tipo_conta_id"     value={tipoContaId} />
              <input type="hidden" name="tipo_conta_custom" value={tipoContaText} />
              <input type="hidden" name="fonte_id"          value={fonteId} />
              <input type="hidden" name="fonte_custom"      value={fonteText} />
              <input type="hidden" name="num_parcelas"      value={numParcelas} />
              <input type="hidden" name="valor_total"       value={valorTotal} />
              <input type="hidden" name="valor_unitario"    value={ehFixo ? valorTotal : valorParcela} />
              <input type="hidden" name="fim_pagamento"     value={fim} />
              <input type="hidden" name="valor_original"    value={valorOriginal} />

              {/* Data de contratação + Título */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Field label="Contratação">
                  <input
                    name="data_contratacao"
                    type="date"
                    className={inputCls}
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Título *">
                    <input name="titulo" type="text" required maxLength={255} className={inputCls} />
                  </Field>
                </div>
              </div>

              {/* Modalidade + Tipo de Conta */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Field label="Modalidade *">
                  <select
                    name="modalidade"
                    required
                    className={inputCls}
                    value={modalidade}
                    onChange={e => setModalidade(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="compra">Compra</option>
                    <option value="divida">Dívida</option>
                    <option value="refinanciamento">Refinanciamento</option>
                    <option value="emprestimo">Empréstimo</option>
                    <option value="investimento">Investimento</option>
                    <option value="plano">Plano</option>
                    <option disabled>──────────</option>
                    <option value="pagamento">Pagamento / Crédito</option>
                  </select>
                </Field>
                <Field
                  label="Tipo de Conta *"
                  hint={!tipoContaId && tipoContaText ? `"${tipoContaText}" será criado` : undefined}
                >
                  <ComboSelect
                    items={tiposConta}
                    value={tipoContaText}
                    onChange={(text, id) => { setTipoContaText(text); setTipoContaId(id); }}
                    placeholder="Selecione ou crie novo"
                    required
                    inputCls={inputCls}
                  />
                </Field>
              </div>

              {/* Valor original — apenas pára dívida e refinanciamento */}
              {(modalidade === "divida" || modalidade === "refinanciamento" || modalidade === "emprestimo") && (
                <Field
                  label="Valor original da dívida (R$)"
                  hint="Quanto você devia originalmente, antes de juros"
                >
                  <input
                    type="number" min="0.01" step="0.01"
                    value={valorOriginal}
                    onChange={e => setValorOriginal(e.target.value)}
                    placeholder="0,00"
                    className={inputCls}
                  />
                </Field>
              )}

              {/* Fonte + Frequência */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Field
                  label="Fonte *"
                  hint={!fonteId && fonteText ? `"${fonteText}" será criado` : undefined}
                >
                  <ComboSelect
                    items={fontes}
                    value={fonteText}
                    onChange={(text, id) => { setFonteText(text); setFonteId(id); }}
                    placeholder="Selecione ou crie nova"
                    required
                    inputCls={inputCls}
                  />
                </Field>
                <Field label="Frequência *">
                  <select
                    name="frequencia_id"
                    required
                    className={inputCls}
                    onChange={e => handleFreqChange(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {frequencias.map(fr => <option key={fr.id} value={fr.id}>{fr.nome}</option>)}
                  </select>
                </Field>
              </div>

              {/* Valores */}
              {ehFixo ? (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Field label="Valor mensal (R$) *" hint={hintValor || undefined}>
                      <input
                        type="number" min="0.01" step="0.01" required
                        value={valorTotal}
                        onChange={e => { setValorTotal(e.target.value); setValorParcela(e.target.value); }}
                        placeholder="0,00"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Início *">
                      <input
                        name="inicio_pagamento"
                        type="date"
                        required
                        value={inicio}
                        onChange={e => handleInicioChange(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field
                    label="Término (opcional)"
                    hint={fim ? `→ ${numParcelas} mês(es) no total` : "Em branco = recorrente sem fim"}
                  >
                    <input
                      type="date"
                      value={fim}
                      onChange={e => handleFixoFimChange(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </>
              ) : (
                <>
                  {/* Linha 1: valor total | parcelas | valor/parcela */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <Field label="Valor total (R$)" hint={hintValor && hintValor.startsWith("→ total") ? hintValor : undefined}>
                      <input
                        type="number" min="0.01" step="0.01"
                        value={valorTotal}
                        onChange={e => handleTotalChange(e.target.value)}
                        placeholder="0,00"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Parcelas" hint={hintData && hintData.includes("parcela") ? hintData : undefined}>
                      <input
                        type="number" min="1" step="1"
                        value={numParcelas}
                        onChange={e => handleNumParcelasChange(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Valor / parcela (R$)" hint={hintValor && hintValor.includes("/") ? hintValor : undefined}>
                      <input
                        type="number" min="0.01" step="0.01"
                        value={valorParcela}
                        onChange={e => handleParcelaChange(e.target.value)}
                        placeholder="0,00"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  {/* Linha 2: início | término */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Field label="Início *" hint={hintData && hintData.includes("término") ? hintData : undefined}>
                      <input
                        name="inicio_pagamento"
                        type="date"
                        required
                        value={inicio}
                        onChange={e => handleInicioChange(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Término">
                      <input
                        type="date"
                        value={fim}
                        onChange={e => handleFimChange(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </>
              )}

              {/* Observação */}
              <Field label="Observação">
                <textarea
                  name="observacao"
                  rows={2}
                  maxLength={1000}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {state.error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-gray-200 text-sm text-gray-600 py-2.5 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {pending ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

