const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  /** Soma de valor_total das contas com 1 parcela no mês selecionado */
  finalizadasTotal: number;
  /** Soma de valor_unitario de todas as contas do mês selecionado */
  mesTotal: number;
  /** Soma de valor_total de todas as contas ativas (não encerradas) */
  dividaTotal: number;
  month: number;
}

export function SummaryCards({ finalizadasTotal, mesTotal, dividaTotal, month }: Props) {
  const nomeMes = MESES[month - 1] ?? "—";

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {/* Contas finalizadas este mês */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 shadow-sm">
        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">
          Finalizadas
        </p>
        <p className="mt-2 text-base sm:text-2xl font-bold text-emerald-600 tabular-nums">
          {brl(finalizadasTotal)}
        </p>
        <p className="mt-0.5 text-[10px] sm:text-xs text-gray-400 hidden sm:block">
          Parcela única encerrada em {nomeMes}
        </p>
      </div>

      {/* Contas do mês */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 shadow-sm">
        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">
          {nomeMes}
        </p>
        <p className="mt-2 text-base sm:text-2xl font-bold text-blue-600 tabular-nums">
          {brl(mesTotal)}
        </p>
        <p className="mt-0.5 text-[10px] sm:text-xs text-gray-400 hidden sm:block">
          Total de parcelas no mês
        </p>
      </div>

      {/* Dívida total */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 shadow-sm">
        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">
          Dívida total
        </p>
        <p className="mt-2 text-base sm:text-2xl font-bold text-red-500 tabular-nums">
          {brl(dividaTotal)}
        </p>
        <p className="mt-0.5 text-[10px] sm:text-xs text-gray-400 hidden sm:block">
          Parcelas restantes a partir de {nomeMes}
        </p>
      </div>
    </div>
  );
}
