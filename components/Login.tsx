
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (userEmail: string) => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (isRegisterMode) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta (se habilitado no Supabase).');
          setIsRegisterMode(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLogin(data.user.email || 'Usuário');
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 space-y-8 border border-white/10">
        <div className="text-center">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-6 shadow-xl shadow-blue-200 dark:shadow-none">
            <span className="text-3xl font-bold text-white">GP</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            {isRegisterMode ? 'Criar Conta' : 'Boas-vindas!'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {isRegisterMode ? 'Cadastre-se para gerenciar pessoas' : 'Acesse sua conta para gerenciar pessoas'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">E-mail</label>
            <input
              required
              type="email"
              placeholder="seu@email.com"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Senha</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-blue-500/20"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isRegisterMode ? 'Cadastrar' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isRegisterMode ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage('');
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {isRegisterMode ? 'Acessar agora' : 'Criar acesso agora'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
