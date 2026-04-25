"use client";

import { useEffect, useRef, useState } from "react";
import type { LookupItem } from "@/models/lookup";

interface Props {
  items       : LookupItem[];
  value       : string;
  onChange    : (text: string, id: string) => void;
  placeholder?: string;
  required?   : boolean;
  inputCls    : string;
}

export function ComboSelect({ items, value, onChange, placeholder, required, inputCls }: Props) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  const q        = value.toLowerCase();
  const filtered = q ? items.filter(i => i.nome.toLowerCase().includes(q)) : items;
  const exact    = items.some(i => i.nome.toLowerCase() === q);

  useEffect(() => {
    function close(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function pick(text: string, id: string) {
    onChange(text, id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value, ""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={inputCls}
      />
      {open && (filtered.length > 0 || (value.trim() && !exact)) && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
          {filtered.map(item => (
            <div
              key={item.id}
              onPointerDown={e => { e.preventDefault(); pick(item.nome, String(item.id)); }}
              className="px-3 py-2.5 text-sm text-gray-800 cursor-pointer hover:bg-blue-50 active:bg-blue-100"
            >
              {item.nome}
            </div>
          ))}
          {value.trim() && !exact && (
            <div
              onPointerDown={e => { e.preventDefault(); pick(value.trim(), ""); }}
              className="px-3 py-2.5 text-sm text-blue-600 font-medium cursor-pointer hover:bg-blue-50 border-t border-gray-100"
            >
              ✚ Criar &ldquo;{value.trim()}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
