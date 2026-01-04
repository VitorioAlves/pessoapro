
import React, { useState, useEffect } from 'react';
import { Person, AppView, Situacao } from './types';
import Sidebar from './components/Sidebar';
import PersonTable from './components/PersonTable';
import PersonForm from './components/PersonForm';
import StatsDashboard from './components/StatsDashboard';
import Login from './components/Login';
import { Icons } from './constants';
import { supabase } from './services/supabase';
import { peopleService } from './services/peopleService';

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

const SettingsSection: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 shadow-sm">
    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
      <span className="text-blue-600 dark:text-blue-400">{icon}</span>
      <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-sm">{title}</h2>
    </div>
    <div className="p-6 space-y-4">
      {children}
    </div>
  </div>
);

const ToggleItem: React.FC<{ label: string; description: string; active: boolean; onToggle: () => void }> = ({ label, description, active, onToggle }) => (
  <div className="flex items-center justify-between group">
    <div className="max-w-[80%]">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{label}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [people, setPeople] = useState<Person[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [editingPerson, setEditingPerson] = useState<Person | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('gpp_theme') === 'dark';
  });

  // Configurações de sistema
  const [sysNotifications, setSysNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [sessionTime, setSessionTime] = useState('60');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuth(true);
        setCurrentUser(session.user.email || '');
        setView('dashboard');
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuth(true);
        setCurrentUser(session.user.email || '');
        setView('dashboard');
      } else {
        setIsAuth(false);
        setCurrentUser('');
        setView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuth) {
      loadPeople();
    }
  }, [isAuth]);

  const loadPeople = async () => {
    setIsLoading(true);
    try {
      const data = await peopleService.fetchPeople();
      setPeople(data);
    } catch (error) {
      showNotification('Erro ao carregar registros.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gpp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gpp_theme', 'light');
    }
  }, [isDarkMode]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (!sysNotifications) return;
    const id = Date.now();
    setNotifications(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleLogin = (user: string) => {
    // Session is handled by onAuthStateChange
    showNotification(`Sessão iniciada como ${user}`, 'info');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSavePerson = async (person: Person) => {
    try {
      const savedPerson = await peopleService.savePerson(person);

      const exists = people.find(p => p.id === person.id);
      if (exists) {
        setPeople(people.map(p => p.id === person.id ? savedPerson : p));
        showNotification(`Registro de ${person.nome} atualizado com sucesso.`, 'success');
      } else {
        setPeople([savedPerson, ...people]);
        showNotification(`Novo cadastro de ${person.nome} realizado.`, 'success');
      }

      setIsFormOpen(false);
      setEditingPerson(undefined);
    } catch (error) {
      showNotification('Erro ao salvar registro.', 'error');
    }
  };

  const handleDeletePerson = async (id: string) => {
    const personToDelete = people.find(p => p.id === id);
    if (window.confirm(`Deseja realmente excluir o registro de ${personToDelete?.nome}?`)) {
      try {
        await peopleService.deletePerson(id);
        setPeople(people.filter(p => p.id !== id));
        showNotification('Registro removido da base de dados.', 'error');
      } catch (error) {
        showNotification('Erro ao remover registro.', 'error');
      }
    }
  };

  const handleResetData = () => {
    if (window.confirm('Deseja recarregar os dados do servidor?')) {
      loadPeople();
    }
  };

  const openEdit = (person: Person) => {
    setEditingPerson(person);
    setIsFormOpen(true);
    setIsSidebarOpen(false);
  };

  const openAdd = () => {
    setEditingPerson(undefined);
    setIsFormOpen(true);
    setIsSidebarOpen(false);
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  if (!isAuth) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Login onLogin={handleLogin} onGoToRegister={() => alert('Sistema de convite apenas. Contate o administrador.')} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 font-['Inter'] ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} md:pl-64 flex flex-col`}>
      <Sidebar
        currentView={view}
        setView={(v) => {
          setView(v);
          setIsSidebarOpen(false);
        }}
        onLogout={handleLogout}
        userName={currentUser}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">GP</div>
          <h1 className="font-bold text-slate-800 dark:text-white">Gestão Pro</h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Icons.Dashboard />
        </button>
      </header>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-6 lg:p-10 relative">
        <div className="max-w-5xl mx-auto h-full">
          {view === 'dashboard' && (
            isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <StatsDashboard people={people} />
            )
          )}
          {view === 'records' && (
            isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <PersonTable
                people={people}
                onEdit={openEdit}
                onDelete={handleDeletePerson}
                onAddNew={openAdd}
              />
            )
          )}

          {view === 'settings' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Configurações</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Personalize sua experiência e gerencie os parâmetros do sistema.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <SettingsSection title="Preferências de Visualização" icon={<Icons.Sun />}>
                    <ToggleItem
                      label="Modo Escuro"
                      description="Interface otimizada para ambientes com pouca iluminação"
                      active={isDarkMode}
                      onToggle={toggleTheme}
                    />
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Formato de Exibição de Data</h3>
                      <div className="flex gap-2">
                        {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => setDateFormat(fmt)}
                            className={`flex-1 py-2 text-[10px] font-black rounded-lg border-2 transition-all ${dateFormat === fmt ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Comunicação e Feedback" icon={<Icons.Dashboard />}>
                    <ToggleItem
                      label="Notificações em Tela (Toasts)"
                      description="Exibir balões flutuantes para ações de sucesso ou erro"
                      active={sysNotifications}
                      onToggle={() => setSysNotifications(!sysNotifications)}
                    />
                    <ToggleItem
                      label="Sons de Sistema"
                      description="Feedback sonoro ao concluir cadastros ou exclusões"
                      active={audioFeedback}
                      onToggle={() => setAudioFeedback(!audioFeedback)}
                    />
                  </SettingsSection>

                  <SettingsSection title="Administração e Segurança" icon={<Icons.Logout />}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Tempo de Sessão</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Tempo de inatividade antes do logout automático</p>
                        </div>
                        <select
                          value={sessionTime}
                          onChange={(e) => setSessionTime(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-white"
                        >
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="60">1 hora</option>
                          <option value="240">4 horas</option>
                        </select>
                      </div>
                      <button
                        onClick={handleResetData}
                        className="w-full py-4 px-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      >
                        <Icons.Delete />
                        Limpar Base Local de Dados
                      </button>
                    </div>
                  </SettingsSection>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">💡</div>
                        <h3 className="text-2xl font-black tracking-tight leading-none uppercase">Roadmap<br />de Sugestões</h3>
                      </div>
                      <p className="text-blue-100/80 text-sm mb-8 leading-relaxed">Funcionalidades planejadas para as próximas iterações do Gestão Pro:</p>
                      <ul className="space-y-5">
                        <li className="flex items-start gap-4 group/item">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0 group-hover/item:bg-white group-hover/item:text-blue-600 transition-all">01</div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tighter">Logs de Auditoria</p>
                            <p className="text-xs text-blue-100/60">Rastreabilidade total: quem, quando e o que foi alterado em cada registro.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-4 group/item">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0 group-hover/item:bg-white group-hover/item:text-blue-600 transition-all">02</div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tighter">Backup Automático</p>
                            <p className="text-xs text-blue-100/60">Integração com Cloud para evitar perda de dados por falhas de cache do navegador.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-4 group/item">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0 group-hover/item:bg-white group-hover/item:text-blue-600 transition-all">03</div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tighter">Relatórios de BI</p>
                            <p className="text-xs text-blue-100/60">Gráficos avançados de série temporal para análise de volume de contratações/autorizações.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
                  </div>

                  <SettingsSection title="Sistema" icon={<Icons.Settings />}>
                    <ToggleItem
                      label="Sincronização Cloud"
                      description="Manter dados atualizados entre diferentes navegadores (Mock)"
                      active={autoBackup}
                      onToggle={() => setAutoBackup(!autoBackup)}
                    />
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                          <Icons.Users />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-slate-800 dark:text-white leading-none mb-1">Idioma</p>
                          <p className="text-[10px] text-slate-500">Português (Brasil)</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-bold shadow-sm text-slate-700 dark:text-slate-200">ALTERAR</button>
                    </div>
                  </SettingsSection>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Notificações Toasts */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 border-l-4 ${n.type === 'success' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-500' :
              n.type === 'error' ? 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 border-red-500' :
                'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-blue-500'
              }`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <span className="font-bold text-sm">{n.message}</span>
          </div>
        ))}
      </div>

      {/* Modal Overlay for Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide">
            <PersonForm
              person={editingPerson}
              onSave={handleSavePerson}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
