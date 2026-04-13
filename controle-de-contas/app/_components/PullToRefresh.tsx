"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const THRESHOLD = 72; // px para acionar o refresh

export function PullToRefresh() {
  const router       = useRouter();
  const startYRef    = useRef(0);
  const [pull, setPull]         = useState(0);   // 0-1 (progresso)
  const [refreshing, setRefreshing] = useState(false);
  const pulling = useRef(false);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      // Só ativa quando está no topo da página
      if (window.scrollY !== 0) return;
      startYRef.current = e.touches[0].clientY;
      pulling.current   = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current || refreshing) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0) { setPull(0); return; }
      // Resistência logarítmica para não puxar demais
      const capped = Math.min(delta, THRESHOLD * 2);
      setPull(capped / THRESHOLD);
      if (delta > 10) e.preventDefault(); // evita scroll nativo ao puxar
    }

    function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      if (pull >= 1) {
        setRefreshing(true);
        setPull(0);
        router.refresh();
        setTimeout(() => setRefreshing(false), 1000);
      } else {
        setPull(0);
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove",  onTouchMove,  { passive: false });
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("touchend",   onTouchEnd);
    };
  }, [pull, refreshing, router]);

  const visible  = pull > 0 || refreshing;
  const progress = Math.min(pull, 1);
  const size     = 28;
  const r        = 10;
  const circ     = 2 * Math.PI * r;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-200"
      style={{ height: visible ? Math.max(pull * THRESHOLD, refreshing ? 44 : 0) : 0 }}
    >
      {visible && (
        <div className="mt-2 flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-100">
          {refreshing ? (
            // Spinner quando está recarregando
            <svg
              className="animate-spin text-blue-500"
              width={size} height={size}
              viewBox={`0 0 ${size} ${size}`}
              fill="none"
            >
              <circle cx={14} cy={14} r={r} stroke="#e5e7eb" strokeWidth="2.5" />
              <path
                d="M14 4 a10 10 0 0 1 10 10"
                stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"
              />
            </svg>
          ) : (
            // Arco de progresso ao puxar
            <svg
              width={size} height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ transform: `rotate(${progress * 180}deg)`, transition: "transform 0.05s" }}
            >
              <circle cx={14} cy={14} r={r} stroke="#e5e7eb" strokeWidth="2.5" fill="none" />
              <circle
                cx={14} cy={14} r={r}
                stroke="#3b82f6" strokeWidth="2.5" fill="none"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                strokeLinecap="round"
                style={{ transformOrigin: "50% 50%", transform: "rotate(-90deg)" }}
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
