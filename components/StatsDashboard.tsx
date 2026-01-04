
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Person, Situacao } from '../types';

interface StatsDashboardProps {
  people: Person[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ people }) => {
  const stats = people.reduce((acc: any, person) => {
    acc[person.situacao] = (acc[person.situacao] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(stats).map(([name, value]) => ({ name, value: Number(value) }));

  const COLORS_MAP: Record<string, string> = {
    [Situacao.AUTORIZADO]: '#10b981',
    [Situacao.LIBERADO]: '#3b82f6',
    [Situacao.IH]: '#f59e0b',
    [Situacao.PENDENTE]: '#6366f1',
    [Situacao.REJEITADO]: '#ef4444',
    [Situacao.BLOQUEIO]: '#4b5563',
    [Situacao.RFB]: '#d946ef'
  };

  const SummaryCard = ({ title, value, color, desc }: { title: string, value: number, color: string, desc: string }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
        <span className="text-xs text-slate-400 dark:text-slate-400">registros</span>
      </div>
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-400 italic">{desc}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Visão Geral</h1>
        <p className="text-slate-500 dark:text-slate-400">Acompanhamento em tempo real da base de dados.</p>
      </header>

      {/* Cards Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Inspeção Humana (IH)"
          value={stats[Situacao.IH] || 0}
          color="text-amber-500 dark:text-amber-400"
          desc="Aguardando triagem manual"
        />
        <SummaryCard
          title="Autorizados"
          value={stats[Situacao.AUTORIZADO] || 0}
          color="text-emerald-500 dark:text-emerald-400"
          desc="Prontos para operação"
        />
        <SummaryCard
          title="Pendentes"
          value={stats[Situacao.PENDENTE] || 0}
          color="text-indigo-500 dark:text-indigo-400"
          desc="Incompletos ou em espera"
        />
        <SummaryCard
          title="Total Registros"
          value={people.length}
          color="text-blue-600 dark:text-blue-400"
          desc="Base total ativa"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Pizza */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Distribuição de Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.name] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_MAP[d.name] }}></div>
                <span className="text-slate-600 dark:text-slate-400 truncate">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo de Atividades Recentes */}
        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Atividades Recentes</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {people.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm italic">Nenhum registro encontrado.</p>
            ) : (
              [...people]
                .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime())
                .slice(0, 5)
                .map((person, index) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {person.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white truncate">{person.nome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        MAI: {person.mai} • {new Date(person.dataCadastro).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div
                      className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${COLORS_MAP[person.situacao] || '#6b7280'}20`,
                        color: COLORS_MAP[person.situacao] || '#6b7280'
                      }}
                    >
                      {person.situacao}
                    </div>
                  </div>
                ))
            )}
          </div>
          {people.length > 5 && (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
              Mostrando 5 de {people.length} registros
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Comparativo de Volume</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: document.documentElement.classList.contains('dark') ? 'rgba(30, 41, 59, 0.3)' : 'rgba(0, 0, 0, 0.05)' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
                  color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
                }}
                itemStyle={{
                  color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
                }}
                labelStyle={{
                  color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.name] || '#ccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
