import { useEffect, useState } from "react";
import { Check, Database, Play, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FaqQuery {
  id: string;
  question_label: string;
  sql_command: string;
  result_columns: string[];
  result_rows: Array<Record<string, unknown>>;
  sort_order: number;
}

const defaultQueries: FaqQuery[] = [
  {
    id: "q-1",
    question_label: "Disponibilidad laboral",
    sql_command: "SELECT modalidad, jornada, disponibilidad_inmediata, ubicacion FROM candidato_perfil;",
    result_columns: ["modalidad", "jornada", "disponibilidad_inmediata", "ubicacion"],
    result_rows: [
      {
        modalidad: "Remoto / Híbrido",
        jornada: "Tiempo Completo / Prácticas",
        disponibilidad_inmediata: "Inmediata",
        ubicacion: "Lima, Perú (UTC-5)",
      },
    ],
    sort_order: 1,
  },
  {
    id: "q-2",
    question_label: "Ventaja técnica & formación dual",
    sql_command: "SELECT formacion_tecnica, enfoque_universitario, valor_agregado FROM perfil_tecnico;",
    result_columns: ["formacion_tecnica", "enfoque_universitario", "valor_agregado"],
    result_rows: [
      {
        formacion_tecnica: "Titulado: Bases de datos, backend y sistemas",
        enfoque_universitario: "Ing. de Software UTP (1er ciclo): Algoritmia y arquitectura",
        valor_agregado: "Productividad inmediata con rigor técnico y visión de largo plazo",
      },
    ],
    sort_order: 2,
  },
  {
    id: "q-3",
    question_label: "Motores de Bases de Datos",
    sql_command: "SELECT motor, tipo, experiencia, nivel FROM stack_databases ORDER BY nivel DESC;",
    result_columns: ["motor", "tipo", "experiencia", "nivel"],
    result_rows: [
      { motor: "PostgreSQL", tipo: "Relacional / ACID", experiencia: "Diseño, RLS, Drizzle", nivel: "Avanzado" },
      { motor: "MySQL / MariaDB", tipo: "Relacional", experiencia: "Optimización, Stored Procedures", nivel: "Avanzado" },
      { motor: "SQL Server", tipo: "Relacional / T-SQL", experiencia: "Consultas analíticas, Modelado", nivel: "Intermedio" },
    ],
    sort_order: 3,
  },
];

export function SqlConsoleFaq() {
  const [queries, setQueries] = useState<FaqQuery[]>(defaultQueries);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(true);
  const [execTime, setExecTime] = useState("0.42 ms");

  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await supabase.from("faq_queries").select("*").order("sort_order");
        if (!error && data && data.length > 0) {
          const mapped: FaqQuery[] = data.map((item) => ({
            id: item.id,
            question_label: item.question_label,
            sql_command: item.sql_command,
            result_columns: item.result_columns || [],
            result_rows: Array.isArray(item.result_rows) ? (item.result_rows as Array<Record<string, unknown>>) : [],
            sort_order: item.sort_order,
          }));
          setQueries(mapped);
        }
      } catch {
        // Fallback to default queries
      }
    })();
  }, []);

  const current = queries[selectedIndex] || queries[0];

  const runQuery = () => {
    setExecuting(true);
    setExecuted(false);
    setTimeout(() => {
      setExecuting(false);
      setExecuted(true);
      setExecTime(`${(Math.random() * 0.4 + 0.15).toFixed(2)} ms`);
    }, 280);
  };

  return (
    <section id="faq" className="sql-console-section section-band">
      <div className="section-heading split-heading">
        <div>
          <p className="kicker">Query Console & FAQ</p>
          <h2>Consultas frecuentes vía SQL.</h2>
        </div>
        <p>
          Explora mis respuestas a dudas habituales de reclutadores y líderes de equipo mediante queries en tiempo real.
        </p>
      </div>

      <div className="sql-terminal-window">
        {/* Console Header Bar */}
        <div className="sql-console-header">
          <div className="sql-console-tabs">
            <span className="sql-tab active">
              <Database className="w-3.5 h-3.5 mr-1 text-copper inline" />
              diegops_db :: faq_consultas.sql
            </span>
          </div>
          <div className="sql-window-controls">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Quick query buttons */}
        <div className="sql-query-selector-bar">
          <span className="selector-title">
            <Terminal className="w-3.5 h-3.5 inline mr-1 text-terminal" /> Preguntas preparadas:
          </span>
          <div className="selector-buttons">
            {queries.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                className={`sql-query-chip ${selectedIndex === idx ? "is-selected" : ""}`}
                onClick={() => {
                  setSelectedIndex(idx);
                  runQuery();
                }}
              >
                {q.question_label}
              </button>
            ))}
          </div>
        </div>

        {/* SQL Command editor mockup */}
        <div className="sql-code-area">
          <div className="sql-code-line">
            <span className="sql-prompt">1</span>
            <span className="sql-comment">-- Consulta generada para: {current?.question_label}</span>
          </div>
          <div className="sql-code-line">
            <span className="sql-prompt">2</span>
            <span className="sql-syntax-highlight">{current?.sql_command}</span>
          </div>
          <div className="sql-code-actions">
            <Button
              size="sm"
              onClick={runQuery}
              disabled={executing}
              className="run-query-btn"
            >
              {executing ? (
                <>Ejecutando…</>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Ejecutar Query
                </>
              )}
            </Button>
            <span className="sql-telemetry">
              {executed && (
                <>
                  <Check className="w-3.5 h-3.5 text-terminal inline mr-1" />
                  Filas devueltas: {current?.result_rows.length ?? 0} · Tiempo de ejecución: {execTime}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Query Output Grid */}
        <div className="sql-output-area">
          {executing ? (
            <div className="sql-loading-box">
              <span className="sql-spinner" />
              <span>Procesando consulta relacional…</span>
            </div>
          ) : (
            <div className="sql-table-wrapper">
              <table className="sql-table">
                <thead>
                  <tr>
                    <th className="row-num-col">#</th>
                    {current?.result_columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {current?.result_rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="row-num-cell">{rowIdx + 1}</td>
                      {current.result_columns.map((col) => (
                        <td key={col} className="sql-data-cell">
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
