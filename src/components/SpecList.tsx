import React, { useMemo, useState } from "react";

export interface SpecItem {
  name: string;
  value: string;
}

/**
 * Props:
 * - specs: входной массив {name, value}
 * - previewGroups: сколько групп показывать в компактном режиме (default 3)
 * - onValueClick?: optional callback (name, value) — вызывается при клике на конкретное значение
 * - className?: css class
 */
const separators = [" — ", " - ", " —", "— ", "—", " -", "- ", "-"];

function splitName(rawName: string): { base: string; label: string } {
  const r = (rawName || "").trim();
  for (const sep of separators) {
    if (r.includes(sep)) {
      const parts = r.split(sep);
      const base = parts[0].trim();
      const label = parts.slice(1).join(sep).trim();
      return { base, label };
    }
  }
  return { base: r, label: "" };
}

function tryParseNumber(s: string) {
  if (s == null) return NaN;
  const normalized = String(s).replace(",", ".").trim();
  if (normalized === "") return NaN;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function sortValues(values: string[]) {
  const parsed = values.map((v) => tryParseNumber(v));
  const allNumbers = parsed.every((n) => !Number.isNaN(n));

  if (allNumbers) {
    return values.slice().sort((a, b) => tryParseNumber(a) - tryParseNumber(b));
  }

  return values.slice().sort((a, b) => {
    if (a === "" && b !== "") return -1;
    if (b === "" && a !== "") return 1;
    return String(a).localeCompare(String(b), "ru");
  });
}

type Grouped = {
  baseName: string;
  subs: Map<string, Set<string>>; // label -> values set
};

export default function SpecList({
  specs = [],
  previewGroups = 3,
  onValueClick,
  className,
}: {
  specs?: SpecItem[];
  previewGroups?: number;
  onValueClick?: (name: string, value: string) => void;
  className?: string;
}) {
  // Группировка + дедупликация
  const groups = useMemo(() => {
    const m = new Map<string, Grouped>();

    for (const s of specs || []) {
      if (!s || typeof s.name !== "string") continue;
      const rawName = s.name.trim();
      const rawValue = s.value == null ? "" : String(s.value).trim();

      const { base, label } = splitName(rawName);
      if (!m.has(base)) m.set(base, { baseName: base, subs: new Map() });
      const grp = m.get(base)!;
      const subKey = label || "";

      if (!grp.subs.has(subKey)) grp.subs.set(subKey, new Set());

      const set = grp.subs.get(subKey)!;

      // значение может содержать ';' — на всякий случай разбиваем
      const parts = String(rawValue)
        .split(";")
        .map((p) => p.trim())
        .filter((p) => p.length > 0 || p === ""); // сохраняем пустую как допустимую

      if (parts.length === 0) set.add("");
      else parts.forEach((p) => set.add(p));
    }

    return Array.from(m.values());
  }, [specs]);

  const [expanded, setExpanded] = useState(false);

  if (!groups || groups.length === 0) return null;

  // Считаем общее количество групп и значений для UI
  const totalGroups = groups.length;
  let shownGroups = groups;
  if (!expanded && previewGroups > 0) {
    shownGroups = groups.slice(0, previewGroups);
  }

  return (
    <div className={className}>
      {shownGroups.map((g) => {
        const subs = Array.from(g.subs.entries()); // [label, Set]
        // короткая запись когда только один sub и label == ""
        if (subs.length === 1 && subs[0][0] === "") {
          const values = Array.from(subs[0][1].values());
          const sorted = sortValues(values);
          const display = sorted.length > 0 ? sorted.join(", ") : "—";
          return (
            <div key={g.baseName} className="mb-1">
              <span className="text-sm font-medium">{g.baseName}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {sorted.map((val, idx) => (
                  <React.Fragment key={val + idx}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onValueClick?.(g.baseName, val);
                      }}
                      className="inline text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                    >
                      {val === "" ? "—" : val}
                    </button>
                    {idx < sorted.length - 1 && ", "}
                  </React.Fragment>
                ))}
              </span>
            </div>
          );
        }

        // Иначе — список подпунктов
        return (
          <div key={g.baseName} className="mb-2">
            <div className="text-sm font-medium">{g.baseName}</div>
            <div className="mt-1 ml-3 space-y-1">
              {subs.map(([label, set]) => {
                const values = Array.from(set.values());
                const sorted = sortValues(values);
                return (
                  <div key={label || Math.random()} className="text-sm">
                    <span className="font-medium">{label || "(без подпункта)"}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {sorted.map((val, idx) => (
                        <React.Fragment key={val + idx}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onValueClick?.(g.baseName + (label ? ` — ${label}` : ""), val);
                            }}
                            className="inline text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                          >
                            {val === "" ? "—" : val}
                          </button>
                          {idx < sorted.length - 1 && ", "}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!expanded && totalGroups > previewGroups && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          className="text-xs mt-1 text-primary hover:underline"
        >
          Показать все ({totalGroups})
        </button>
      )}

      {expanded && totalGroups > previewGroups && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
          className="text-xs mt-1 text-muted-foreground hover:underline"
        >
          Свернуть
        </button>
      )}
    </div>
  );
}