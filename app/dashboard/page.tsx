import { getSession }       from "@/lib/session";
import { redirect }         from "next/navigation";
import { getMonthlyContas, getDividaTotal } from "@/models/conta";
import { getPagamentosDoMes }             from "@/models/pagamento";
import type { Pagamento }                 from "@/models/pagamento";
import { getTipoConta, getFonte, getFrequencia } from "@/models/lookup";
import { logoutAction }     from "@/app/login/actions";
import { DonutChart }       from "./_components/DonutChart";
import { MonthlyList }      from "./_components/MonthlyList";
import { MonthNavigator }   from "./_components/MonthNavigator";
import { NovaContaModal }   from "./_components/NovaContaModal";
import type { FonteGroup }  from "./_components/MonthlyList";
import { SummaryCards }     from "./_components/SummaryCards";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await getSession();
  if (!session.loggedIn) redirect("/login");

  const params = await searchParams;
  const now    = new Date();
  const year   = Number(params.year  ?? now.getFullYear());
  const month  = Number(params.month ?? now.getMonth() + 1);

  const [contas, tiposConta, fontes, frequencias, dividaTotal, pagamentos] = await Promise.all([
    getMonthlyContas(session.userId, year, month),
    getTipoConta(),
    getFonte(),
    getFrequencia(),
    getDividaTotal(session.userId, year, month),
    getPagamentosDoMes(session.userId, year, month),
  ]);

  // ── Agrupamento por fonte ───────────────────────────────────────────────────
  const map = new Map<string, FonteGroup>();
  for (const c of contas) {
    if (!map.has(c.fonte_nome))
      map.set(c.fonte_nome, { nome: c.fonte_nome, contas: [], subtotal: 0 });
    const g = map.get(c.fonte_nome)!;
    g.contas.push(c);
    // pagamento/crédito subtrai do subtotal
    const sinal = c.modalidade === "pagamento" ? -1 : 1;
    g.subtotal += sinal * Number(c.valor_unitario);
  }
  const groups     = [...map.values()];
  const grandTotal = groups.reduce((s, g) => s + g.subtotal, 0);

  // ── Dados para gráficos ─────────────────────────────────────────────────────
  const byFonte: Record<string, number> = {};
  const byTipo : Record<string, number> = {};
  const byFreq : Record<string, number> = {};
  for (const c of contas) {
    const v = Number(c.valor_unitario);
    // pagamento não entra nos gráficos de despesas
    if (c.modalidade === "pagamento") continue;
    byFonte[c.fonte_nome]      = (byFonte[c.fonte_nome]      || 0) + v;
    byTipo [c.tipo_conta_nome] = (byTipo [c.tipo_conta_nome] || 0) + v;
    byFreq [c.frequencia_nome] = (byFreq [c.frequencia_nome] || 0) + v;
  }
  const toSlices = (obj: Record<string, number>) =>
    Object.entries(obj).map(([label, value]) => ({ label, value }));

  // ── Totais de resumo ──────────────────────────────────────────────────────
  // Contas finalizadas = última parcela sendo paga NESTE mês
  const finalizadasTotal = contas
    .filter(c => {
      if (!c.fim_pagamento || c.num_parcelas === 0) return false;
      const [fy, fm] = c.fim_pagamento.split("-").map(Number);
      return fy === year && fm === month;
    })
    .reduce((s, c) => s + Number(c.valor_unitario), 0);
  // Total bruto do mês (sem pagamentos)
  const mesTotal = contas
    .filter(c => c.modalidade !== "pagamento")
    .reduce((s, c) => s + Number(c.valor_unitario), 0);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">Controle de Contas</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gray-500 hidden sm:block">
            Olá, <span className="font-semibold text-gray-700">{session.nome}</span>
          </span>
          <span className="text-sm text-gray-500 sm:hidden font-semibold text-gray-700">
            {session.nome?.split(" ")[0]}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-red-500 hover:text-red-600 font-medium transition px-2 py-1 rounded-lg hover:bg-red-50 active:bg-red-100"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Cards de resumo */}
        <SummaryCards
          finalizadasTotal={finalizadasTotal}
          mesTotal={mesTotal}
          dividaTotal={dividaTotal}
          month={month}
        />

        {/* Navegação de mês + botão Nova Conta */}
        <div className="flex items-center justify-between">
          <MonthNavigator year={year} month={month} />
          <NovaContaModal tiposConta={tiposConta} fontes={fontes} frequencias={frequencias} />
        </div>

        {/* Gráficos — scroll horizontal em mobile, grid em desktop */}
        <div className="flex gap-3 overflow-x-auto pb-1 sm:pb-0 sm:grid sm:grid-cols-3 snap-x snap-mandatory">
          <div className="snap-start shrink-0 w-[80vw] sm:w-auto">
            <DonutChart slices={toSlices(byFonte)} title="Por Fonte" />
          </div>
          <div className="snap-start shrink-0 w-[80vw] sm:w-auto">
            <DonutChart slices={toSlices(byTipo)}  title="Por Tipo de Conta" />
          </div>
          <div className="snap-start shrink-0 w-[80vw] sm:w-auto">
            <DonutChart slices={toSlices(byFreq)}  title="Por Frequência" />
          </div>
        </div>

        {/* Lista mensal */}
        <MonthlyList
          groups={groups}
          grandTotal={grandTotal}
          tiposConta={tiposConta}
          fontes={fontes}
          frequencias={frequencias}
          year={year}
          month={month}
          pagamentos={pagamentos}
        />
      </div>
    </main>
  );
}

