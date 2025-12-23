import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: View.EXPENSES, label: 'Gastos (Subir)', icon: '📝' },
    { id: View.HISTORY, label: 'Historial de Gastos', icon: '📊' },
    { id: View.COMMERCIALS, label: 'Comerciales', icon: '👥' },
    { id: View.TYPES, label: 'Tipos de Gasto', icon: '🏷️' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 h-full shadow-xl z-10">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700">
        {/* Logo Placeholder */}
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
          E
        </div>
        <h1 className="text-xl font-bold tracking-tight">Empresa S.A.</h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium ${
              currentView === item.id
                ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        Gestión de Gastos v1.0
      </div>
    </div>
  );
};

export default Sidebar;
