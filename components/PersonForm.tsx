
import React, { useState, useEffect } from 'react';
import { Person, Situacao } from '../types';
import { Icons } from '../constants';

interface PersonFormProps {
  person?: Person;
  onSave: (person: Person) => void;
  onCancel: () => void;
}

// Moved outside component to prevent re-renders causing focus loss
const InputWrapper = ({ label, children, icon, required }: { label: string, children: React.ReactNode, icon?: React.ReactNode, required?: boolean }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10">
          {icon}
        </div>
      )}
      {children}
    </div>
  </div>
);

const inputClasses = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500 shadow-inner";

const inputWithIconClasses = "w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500 shadow-inner";

const PersonForm: React.FC<PersonFormProps> = ({ person, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Person, 'id'>>({
    nome: '',
    cpf: '',
    mai: '',
    dataCadastro: new Date().toISOString().split('T')[0],
    contatos: '',
    observacoes: '',
    situacao: Situacao.PENDENTE,
  });

  useEffect(() => {
    if (person) {
      setFormData({
        nome: person.nome,
        cpf: person.cpf,
        mai: person.mai,
        dataCadastro: person.dataCadastro,
        contatos: person.contatos,
        observacoes: person.observacoes,
        situacao: person.situacao,
      });
    }
  }, [person]);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatMAI = (value: string) => {
    // Remove qualquer caractere não numérico e limita a 9 dígitos
    return value.replace(/\D/g, '').slice(0, 9);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      const maskedValue = formatCPF(value);
      setFormData(prev => ({ ...prev, [name]: maskedValue }));
    } else if (name === 'mai') {
      const maskedValue = formatMAI(value);
      setFormData(prev => ({ ...prev, [name]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: person?.id || '',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-8 text-white">
        <h2 className="text-2xl font-black tracking-tight">{person ? 'EDITAR REGISTRO' : 'NOVO CADASTRO'}</h2>
        <p className="text-blue-100/80 text-sm mt-1">Insira as informações necessárias para manter a base atualizada.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-1 rounded">
              <Icons.User />
            </span>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Dados Pessoais</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2">
              <InputWrapper label="Nome Completo" icon={<Icons.User />} required>
                <input
                  required
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome completo do colaborador"
                  className={inputWithIconClasses}
                />
              </InputWrapper>
            </div>
            <InputWrapper label="CPF" icon={<Icons.IdCard />} required>
              <input
                required
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className={inputWithIconClasses}
              />
            </InputWrapper>
            <InputWrapper label="Contatos" icon={<Icons.Phone />} required>
              <input
                required
                type="text"
                name="contatos"
                value={formData.contatos}
                onChange={handleChange}
                placeholder="E-mail ou Telefone corporativo"
                className={inputWithIconClasses}
              />
            </InputWrapper>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-1 rounded">
              <Icons.Dashboard />
            </span>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Dados de Registro</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputWrapper label="Código MAI" icon={<Icons.IdCard />} required>
              <input
                required
                type="text"
                name="mai"
                value={formData.mai}
                onChange={handleChange}
                placeholder="000000000"
                maxLength={9}
                inputMode="numeric"
                className={inputWithIconClasses}
              />
            </InputWrapper>
            <InputWrapper label="Data de Cadastro" icon={<Icons.Calendar />} required>
              <input
                required
                type="date"
                name="dataCadastro"
                value={formData.dataCadastro}
                onChange={handleChange}
                className={inputWithIconClasses}
              />
            </InputWrapper>
            <InputWrapper label="Situação Atual">
              <select
                name="situacao"
                value={formData.situacao}
                onChange={handleChange}
                className={`${inputClasses} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat`}
              >
                {Object.values(Situacao).map((sit) => (
                  <option key={sit} value={sit}>{sit}</option>
                ))}
              </select>
            </InputWrapper>
            <div className="md:col-span-2">
              <InputWrapper label="Observações Técnicas">
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClasses} resize-none`}
                  placeholder="Informações adicionais relevantes..."
                />
              </InputWrapper>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] uppercase tracking-wider"
          >
            {person ? 'Confirmar Atualização' : 'Finalizar Cadastro'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-all uppercase tracking-wider"
          >
            Descartar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonForm;
