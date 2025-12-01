/**
 * TimeseriesChart Component
 * 
 * Componente para renderizar gráficos de séries temporais.
 * Por enquanto é um placeholder - será implementado com biblioteca de gráficos nas próximas sprints.
 */

type TimeseriesPoint = { x: string; y: number | null };

type TimeseriesSeries = {
  id: string;
  label: string;
  points: TimeseriesPoint[];
};

type TimeseriesChartProps = {
  id: string;
  title: string;
  series: TimeseriesSeries[];
  granularity: 'day' | 'week' | 'month';
};

export function TimeseriesChart({ id, title, series, granularity }: TimeseriesChartProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 bg-gray-50 rounded flex flex-col items-center justify-center">
        <svg
          className="w-16 h-16 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
        <p className="text-sm text-gray-500 mb-1">Gráfico de Série Temporal</p>
        <p className="text-xs text-gray-400">
          {series.length} série{series.length !== 1 ? 's' : ''} • Granularidade: {granularity}
        </p>
      </div>
      {/* Legenda */}
      {series.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {series.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: `hsl(${(idx * 360) / series.length}, 70%, 50%)`,
                }}
              />
              <span className="text-sm text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
