"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { editarContaAction, type ContaActionState } from "../actions";
import type { LookupItem } from "@/models/lookup";
import { ComboSelect } from "./ComboSelect";
import type { ContaWithJoins } from "@/models/conta";

// ── Helpers ───────────────────────────────────────────────────────────────────
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
function isoToDisplay(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

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

// ── Componente ────────────────────────────────────────────────────────────────
interface Props {
  conta      : ContaWithJoins;
  tiposConta : LookupItem[];
  fontes     : LookupItem[];
  frequencias: LookupItem[];
  year       : number;
  month      : number;
}

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export function EditarContaModal({ conta, tiposConta, fontes, frequencias, year, month }: Props) {
  const [open, setOpen]              = useState(false);
  const formRef                      = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<ContaActionState, FormData>(editarContaAction, {});

  const [titulo,          setTitulo]          = useState("");
  const [dataContratacao, setDataContratacao] = useState("");
  const [valorTotal,      setValorTotal]      = useState("");
  const [valorParcela,    setValorParcela]    = useState("");
  const [numParcelas,     setNumParcelas]     = useState("1");
  const [inicio,          setInicio]          = useState("");
  const [fim,             setFim]             = useState("");
  const [ehFixo,          setEhFixo]          = useState(false);
  const [modalidade,      setModalidade]      = useState("");
  const [valorOriginal,   setValorOriginal]   = useState("");
  const [tipoContaText,   setTipoContaText]   = useState("");
  const [tipoContaId,     setTipoContaId]     = useState("");
  const [fonteText,       setFonteText]       = useState("");
  const [fonteId,         setFonteId]         = useState("");
  const [frequenciaId,    setFrequenciaId]    = useState("");
  const [observacao,      setObservacao]      = useState("");
  const [hintValor,       setHintValor]       = useState("");
  const [hintData,        setHintData]        = useState("");

  function fill() {
    setTitulo(conta.titulo);
    setDataContratacao(conta.data_contratacao ?? "");
    setValorTotal(Number(conta.valor_total).toFixed(2));
    setValorParcela(Number(conta.valor_unitario).toFixed(2));
    setNumParcelas(String(conta.num_parcelas));
    setInicio(conta.inicio_pagamento);
    setFim(conta.fim_pagamento ?? "");
    const fr = frequencias.find(f => f.id === conta.frequencia_id);
    setEhFixo(fr?.nome.toLowerCase() === "fixo");
    setModalidade(conta.modalidade);
    setValorOriginal(conta.valor_original != null ? Number(conta.valor_original).toFixed(2) : "");
    setTipoContaText(conta.tipo_conta_nome);
    setTipoContaId(String(conta.tipo_conta_id));
    setFonteText(conta.fonte_nome);
    setFonteId(String(conta.fonte_id));
    setFrequenciaId(String(conta.frequencia_id));
    setObservacao(conta.observacao ?? "");
    setHintValor(""); setHintData("");
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) fill(); }, [open, conta.id]);
  useEffect(() => { if (state?.success) setOpen(false); }, [state]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleTotalChange(v: string) {
    setValorTotal(v);
    const vt = parseFloat(v), n = parseInt(numParcelas);
    if (!isNaN(vt) && vt > 0 && n > 0) {
      const p = (vt / n).toFixed(2);
      setValorParcela(p);
      setHintValor(n > 1 ? `→ R$ ${p} / parcela` : "");
    }
  }
  function handleParcelaChange(v: string) {
    setValorParcela(v);
    const vp = parseFloat(v), n = parseInt(numParcelas);
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
      const vt = parseFloat(valorTotal), vp = parseFloat(valorParcela);
      if (!isNaN(vt) && vt > 0) {
        const p = (vt / n).toFixed(2);
        setValorParcela(p);
        setHintValor(`→ R$ ${p} / parcela`);
      } else if (!isNaN(vp) && vp > 0) {
        const t = (vp * n).toFixed(2);
        setValorTotal(t);
        setHintValor(`→ total R$ ${t}`);
      }
      if (inicio) {
        const novoFim = n === 1 ? inicio : addMonths(inicio, n - 1);
        setFim(novoFim);
        setHintData(`→ término: ${isoToDisplay(novoFim)}`);
      }
    }
  }
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
      const n = Math.max(1, monthsBetween(inicio, v) + 1);
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
  function handleFreqChange(id: string) {
    setFrequenciaId(id);
    const fr = frequencias.find(f => String(f.id) === id);
    const isFixo = fr?.nome.toLowerCase() === "fixo";
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
  function handleTipoContaChange(v: string) {
    setTipoContaText(v);
    const match = tiposConta.find(t => t.nome.toLowerCase() === v.toLowerCase());
    setTipoContaId(match ? String(match.id) : "");
  }
  function handleFonteChange(v: string) {
    setFonteText(v);
    const match = fontes.find(f => f.nome.toLowerCase() === v.toLowerCase());
    setFonteId(match ? String(match.id) : "");
  }

  return (
    <>
      {/* Botão lápis */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-1.5 text-gray-400 hover:text-blue-500 transition rounded-lg hover:bg-blue-50 active:bg-blue-100"
        aria-label="Editar conta"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
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
              <h2 className="text-base font-semibold text-gray-800">Editar Conta</h2>
              <button type="button" onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {/* Aviso temporal para fixos */}
            {conta.num_parcelas === 0 && (
              <div className="mx-4 sm:mx-6 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                ⚠️ Gasto <strong>fixo</strong>: alterações vão de <strong>{MESES[month - 1]}/{year}</strong> em diante. Meses anteriores permanecem inalterados.
              </div>
            )}

            {/* Form */}
            <form ref={formRef} action={formAction} className="overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
              <input type="hidden" name="id"             value={conta.id} />
              <input type="hidden" name="view_year"      value={year} />
              <input type="hidden" name="view_month"     value={month} />
              <input type="hidden" name="tipo_conta_id"     value={tipoContaId} />
              <input type="hidden" name="tipo_conta_custom" value={tipoContaText} />
              <input type="hidden" name="fonte_id"          value={fonteId} />
              <input type="hidden" name="fonte_custom"      value={fonteText} />
              <input type="hidden" name="num_parcelas"      value={numParcelas} />
              <input type="hidden" name="valor_total"       value={valorTotal} />
              <input type="hidden" name="valor_unitario"    value={ehFixo ? valorTotal : valorParcela} />
              <input type="hidden" name="fim_pagamento"     value={fim} />
              <input type="hidden" name="valor_original"    value={valorOriginal} />

              {/* Contratação + Título */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Field label="Contratação">
                  <input type="date" name="data_contratacao"
                    value={dataContratacao} onChange={e => setDataContratacao(e.target.value)}
                    className={inputCls} />
                </Field>
                <div className="col-span-2">
                  <Field label="Título *">
                    <input name="titulo" type="text" required maxLength={255}
                      value={titulo} onChange={e => setTitulo(e.target.value)}
                      className={inputCls} />
                  </Field>
                </div>
              </div>

              {/* Modalidade + Tipo */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Field label="Modalidade *">
                  <select name="modalidade" required className={inputCls}
                    value={modalidade} onChange={e => setModalidade(e.target.value)}>
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
                <Field label="Tipo de Conta *"
                  hint={!tipoContaId && tipoContaText ? `"${tipoContaText}" será criado` : undefined}>
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

              {/* Valor original */}
              {(modalidade === "divida" || modalidade === "refinanciamento" || modalidade === "emprestimo") && (
                <Field label="Valor original da dívida (R$)" hint="Quanto você devia originalmente, antes de juros">
                  <input type="number" min="0.01" step="0.01"
                    value={valorOriginal} onChange={e => setValorOriginal(e.target.value)}
                    placeholder="0,00" className={inputCls} />
                </Field>
              )}

              {/* Fonte + Frequência */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Field label="Fonte *"
                  hint={!fonteId && fonteText ? `"${fonteText}" será criado` : undefined}>
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
                  <select name="frequencia_id" required className={inputCls}
                    value={frequenciaId} onChange={e => handleFreqChange(e.target.value)}>
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
                      <input type="number" min="0.01" step="0.01" required
                        value={valorTotal}
                        onChange={e => { setValorTotal(e.target.value); setValorParcela(e.target.value); }}
                        placeholder="0,00" className={inputCls} />
                    </Field>
                    <Field label="Início *">
                      <input name="inicio_pagamento" type="date" required
                        value={inicio} onChange={e => handleInicioChange(e.target.value)} className={inputCls} />
                    </Field>
                  </div>
                  <Field
                    label="Término (opcional)"
                    hint={fim ? `→ ${numParcelas} mês(es) no total` : "Em branco = recorrente sem fim"}
                  >
                    <input type="date"
                      value={fim} onChange={e => handleFixoFimChange(e.target.value)}
                      className={inputCls} />
                  </Field>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <Field label="Valor total (R$)"
                      hint={hintValor && hintValor.startsWith("→ total") ? hintValor : undefined}>
                      <input type="number" min="0.01" step="0.01"
                        value={valorTotal} onChange={e => handleTotalChange(e.target.value)}
                        placeholder="0,00" className={inputCls} />
                    </Field>
                    <Field label="Parcelas"
                      hint={hintData && hintData.includes("parcela") ? hintData : undefined}>
                      <input type="number" min="1" step="1"
                        value={numParcelas} onChange={e => handleNumParcelasChange(e.target.value)}
                        className={inputCls} />
                    </Field>
                    <Field label="Valor / parcela (R$)"
                      hint={hintValor && hintValor.includes("/") ? hintValor : undefined}>
                      <input type="number" min="0.01" step="0.01"
                        value={valorParcela} onChange={e => handleParcelaChange(e.target.value)}
                        placeholder="0,00" className={inputCls} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Field label="Início *"
                      hint={hintData && hintData.includes("término") ? hintData : undefined}>
                      <input name="inicio_pagamento" type="date" required
                        value={inicio} onChange={e => handleInicioChange(e.target.value)}
                        className={inputCls} />
                    </Field>
                    <Field label="Término">
                      <input type="date"
                        value={fim} onChange={e => handleFimChange(e.target.value)}
                        className={inputCls} />
                    </Field>
                  </div>
                </>
              )}

              {/* Observação */}
              <Field label="Observação">
                <textarea name="observacao" rows={2} maxLength={1000}
                  value={observacao} onChange={e => setObservacao(e.target.value)}
                  className={`${inputCls} resize-none`} />
              </Field>

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-gray-200 text-sm text-gray-600 py-2.5 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={pending}
                  className="flex-1 rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 transition disabled:opacity-60">
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
