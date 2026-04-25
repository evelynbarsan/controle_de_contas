"use client";

import { useRouter } from "next/navigation";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export function MonthNavigator({ year, month }: { year: number; month: number }) {
  const router = useRouter();

  function go(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    router.push(`/dashboard?year=${y}&month=${m}`);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => go(-1)}
        className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 text-gray-500 text-xl font-bold transition"
        aria-label="Mês anterior"
      >&#8249;</button>
      <span className="text-sm font-semibold text-gray-700 w-36 text-center select-none">
        {MONTHS[month - 1]} {year}
      </span>
      <button
        onClick={() => go(1)}
        className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 active:bg-gray-300 text-gray-500 text-xl font-bold transition"
        aria-label="Próximo mês"
      >&#8250;</button>
    </div>
  );
}
