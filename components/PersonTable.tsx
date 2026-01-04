
import React, { useState, useMemo, useEffect } from 'react';
import { Person, Situacao } from '../types';
import { Icons } from '../constants';

interface PersonTableProps {
  people: Person[];
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

type SortField = 'nome' | 'dataCadastro';
type SortOrder = 'asc' | 'desc';

const PersonTable: React.FC<PersonTableProps> = ({ people, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortField, sortOrder, itemsPerPage]);

  const processedPeople = useMemo(() => {
    let result = people.filter(p => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search ||
        p.nome.toLowerCase().includes(search) ||
        p.cpf.includes(search) ||
        p.mai.toLowerCase().includes(search) ||
        p.contatos.toLowerCase().includes(search);

      const matchesStatus = filterStatus === 'todos' || p.situacao === filterStatus;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let valA = a[sortField].toLowerCase();
      let valB = b[sortField].toLowerCase();

      if (sortField === 'dataCadastro') {
        valA = new Date(a.dataCadastro).getTime().toString();
        valB = new Date(b.dataCadastro).getTime().toString();
      }

      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return result;
  }, [people, searchTerm, filterStatus, sortField, sortOrder]);

  const totalPages = Math.ceil(processedPeople.length / itemsPerPage);
  const paginatedPeople = processedPeople.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Situacao) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-colors";
    switch (status) {
      case Situacao.AUTORIZADO: return `${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`;
      case Situacao.LIBERADO: return `${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
      case Situacao.IH: return `${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
      case Situacao.REJEITADO: return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
      case Situacao.BLOQUEIO: return `${baseClasses} bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300`;
      case Situacao.RFB: return `${baseClasses} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400`;
      case Situacao.PENDENTE: return `${baseClasses} bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400`;
      default: return `${baseClasses} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400`;
    }
  };

  const handleExportCSV = () => {
    const headers = "Nome,CPF,MAI,Data,Situacao,Contatos\n";
    const csv = processedPeople.map(p =>
      `"${p.nome}","${p.cpf}","${p.mai}","${p.dataCadastro}","${p.situacao}","${p.contatos}"`
    ).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-gestao.csv`;
    a.click();
  };

  const handleExportWord = () => {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Relatório de Gestão Pro</title>
        <style>
          body { font-family: 'Arial', sans-serif; }
          .header { text-align: center; margin-bottom: 20px; }
          .title { font-size: 24pt; font-weight: bold; color: #1e40af; margin-bottom: 5px; }
          .subtitle { font-size: 12pt; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #2563eb; color: #ffffff; padding: 12px; text-align: left; font-size: 10pt; text-transform: uppercase; }
          td { border: 1px solid #e2e8f0; padding: 10px; font-size: 9pt; vertical-align: middle; }
          .badge { padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 8pt; text-transform: uppercase; }
          .footer { margin-top: 30px; font-size: 8pt; color: #94a3b8; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Relatório de Gestão de Pessoas</div>
          <div class="subtitle">Gerado em ${dateStr} - Sistema Gestão Pro</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>MAI</th>
              <th>Data Cadastro</th>
              <th>Situação</th>
              <th>Contatos</th>
            </tr>
          </thead>
          <tbody>
            ${processedPeople.map(p => `
              <tr>
                <td style="font-weight: bold;">${p.nome}</td>
                <td>${p.cpf}</td>
                <td style="color: #2563eb;">${p.mai}</td>
                <td>${new Date(p.dataCadastro).toLocaleDateString('pt-BR')}</td>
                <td>${p.situacao}</td>
                <td>${p.contatos}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Este documento foi gerado automaticamente pelo sistema Gestão Pro.</div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-gestao-${new Date().getTime()}.doc`;
    a.click();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Gestão de Registros</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Controle total e busca avançada na base de dados.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all shadow-sm"
          >
            <Icons.Download />
            CSV
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Word
          </button>
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 focus:ring-2 focus:ring-blue-500"
          >
            <Icons.Plus />
            Novo Registro
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex flex-col lg:flex-row gap-5">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Busca Inteligente (Nome, CPF, MAI, Contatos...)"
              className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 rounded-2xl text-base placeholder-slate-400 dark:placeholder-slate-500 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Exibir</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="text-sm font-semibold bg-white dark:bg-slate-800 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-200 dark:hover:border-slate-600 transition-colors"
              >
                <option value={5}>5 linhas</option>
                <option value={10}>10 linhas</option>
                <option value={20}>20 linhas</option>
                <option value={50}>50 linhas</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Situação</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm font-semibold bg-white dark:bg-slate-800 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-200 dark:hover:border-slate-600 transition-colors"
              >
                <option value="todos">Todos os Status</option>
                {Object.values(Situacao).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Ordenar por</span>
              <div className="flex items-center bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="text-sm font-semibold bg-transparent dark:text-white px-3 py-2 focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <option value="nome">Nome</option>
                  <option value="dataCadastro">Data Cadastro</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border-l border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-950/40">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => toggleSort('nome')}>
                  Nome {sortField === 'nome' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documentação</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => toggleSort('dataCadastro')}>
                  Data {sortField === 'dataCadastro' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Situação</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedPeople.length > 0 ? paginatedPeople.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-all group border-l-4 border-transparent hover:border-blue-500">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        {p.nome.charAt(0)}
                      </div>
                      <div className="max-w-[250px]">
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate transition-colors">{p.nome}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.contatos}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{p.cpf}</div>
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded inline-block mt-1">{p.mai}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {new Date(p.dataCadastro).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={getStatusBadge(p.situacao)}>{p.situacao}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onEdit(p)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all"><Icons.Edit /></button>
                      <button onClick={() => onDelete(p.id)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"><Icons.Delete /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center text-slate-400 dark:text-slate-600">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center opacity-50">
                        <Icons.Search />
                      </div>
                      <div>
                        <p className="text-lg font-bold">Nenhum registro encontrado</p>
                        <p className="text-sm">Tente ajustar seus filtros ou busca.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors">
          <div>
            Mostrando <span className="text-blue-600 dark:text-blue-400 font-black">{Math.min(paginatedPeople.length, itemsPerPage)}</span> de <span className="font-black">{processedPeople.length}</span> resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold shadow-sm"
            >
              Anterior
            </button>
            <div className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg font-black min-w-[3rem] text-center">
              {currentPage}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold shadow-sm"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonTable;
