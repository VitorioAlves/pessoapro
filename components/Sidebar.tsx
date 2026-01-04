
import React from 'react';
import { Icons } from '../constants';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  userName: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  onLogout, 
  userName,
  isDarkMode,
  toggleTheme 
}) => {
  const menuItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: <Icons.Dashboard /> },
    { id: 'records' as AppView, label: 'Registros', icon: <Icons.Users /> },
    { id: 'settings' as AppView, label: 'Configurações', icon: <Icons.Settings /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-blue-900 dark:bg-slate-900 text-white flex flex-col z-40 transition-all duration-300 transform -translate-x-full md:translate-x-0 border-r border-blue-800 dark:border-slate-800">
      <div className="p-6 border-b border-blue-800 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">GP</div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Gestão Pro</h1>
          <p className="text-xs text-blue-300 dark:text-blue-400">Pessoas & Controle</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-blue-600 text-white font-medium shadow-lg' 
                : 'text-blue-200 hover:bg-blue-800 dark:hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-blue-800 dark:border-slate-800 bg-blue-950/50 dark:bg-slate-950/50">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 mb-4 text-blue-200 hover:text-white hover:bg-blue-800 dark:hover:bg-slate-800 rounded-xl transition-all border border-blue-700/50 dark:border-slate-700/50"
        >
          {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
          {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>

        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 font-bold text-xs">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-blue-400">Administrador</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-blue-300 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Icons.Logout />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
