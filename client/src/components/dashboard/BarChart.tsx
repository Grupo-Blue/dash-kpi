/**
 * BarChart Component
 * 
 * Componente para renderizar gráficos de barras.
 * Por enquanto é um placeholder - será implementado com biblioteca de gráficos nas próximas sprints.
 */

type BarCategory = { x: string; y: number | null };

type BarChartProps = {
  id: string;
  title: string;
  categories: BarCategory[];
};

export function BarChart({ id, title, categories }: BarChartProps) {
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-sm text-gray-500 mb-1">Gráfico de Barras</p>
        <p className="text-xs text-gray-400">
          {categories.length} categoria{categories.length !== 1 ? 's' : ''}
        </p>
      </div>
      {/* Preview das categorias */}
      {categories.length > 0 && (
        <div className="mt-4 space-y-2">
          {categories.slice(0, 5).map((cat) => (
            <div key={cat.x} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{cat.x}</span>
              <span className="font-medium text-gray-900">
                {cat.y !== null ? cat.y.toLocaleString('pt-BR') : '—'}
              </span>
            </div>
          ))}
          {categories.length > 5 && (
            <p className="text-xs text-gray-400 text-center pt-2">
              + {categories.length - 5} categorias
            </p>
          )}
        </div>
      )}
    </div>
  );
}
