import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ExpenseForm from './components/ExpenseForm';
import HistoryView from './components/HistoryView';
import EntityManagement from './components/EntityManagement';
import { View, Expense, Commercial, ExpenseType } from './types';

// Initial Mock Data to populate first time
const INITIAL_TYPES: ExpenseType[] = [
    { id: '1', name: 'Desplazamientos' },
    { id: '2', name: 'Comidas' },
    { id: '3', name: 'Alojamiento' },
    { id: '4', name: 'Otros gastos' }
];

const INITIAL_COMMERCIALS: Commercial[] = [
    { id: '1', name: 'Juan Pérez', email: 'juan@empresa.com', phone: '555-0101' },
    { id: '2', name: 'María García', email: 'maria@empresa.com', phone: '555-0102' }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.EXPENSES);
  
  // State Management with LocalStorage
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [commercials, setCommercials] = useState<Commercial[]>(() => {
    const saved = localStorage.getItem('commercials');
    return saved ? JSON.parse(saved) : INITIAL_COMMERCIALS;
  });

  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>(() => {
    const saved = localStorage.getItem('expenseTypes');
    return saved ? JSON.parse(saved) : INITIAL_TYPES;
  });

  // Persist to LocalStorage
  useEffect(() => { localStorage.setItem('expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('commercials', JSON.stringify(commercials)); }, [commercials]);
  useEffect(() => { localStorage.setItem('expenseTypes', JSON.stringify(expenseTypes)); }, [expenseTypes]);

  // Handlers
  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    setCurrentView(View.HISTORY); // Redirect to history after adding
  };

  const deleteExpense = (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este gasto?')) {
        setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const updateExpense = (updated: Expense) => {
      setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  // Generic Handlers for EntityManagement
  const handleEntityCRUD = (
      setter: React.Dispatch<React.SetStateAction<any[]>>,
      items: any[]
  ) => ({
      add: (item: any) => setter([...items, item]),
      delete: (id: string) => {
        if(confirm('¿Eliminar registro?')) setter(items.filter(i => i.id !== id))
      },
      update: (item: any) => setter(items.map(i => i.id === item.id ? item : i))
  });

  const commCRUD = handleEntityCRUD(setCommercials, commercials);
  const typeCRUD = handleEntityCRUD(setExpenseTypes, expenseTypes);

  // Render View Logic
  const renderContent = () => {
    switch (currentView) {
        case View.EXPENSES:
            return (
                <ExpenseForm 
                    commercials={commercials} 
                    expenseTypes={expenseTypes} 
                    onSave={addExpense} 
                />
            );
        case View.HISTORY:
            return (
                <HistoryView 
                    expenses={expenses}
                    commercials={commercials}
                    expenseTypes={expenseTypes}
                    onDelete={deleteExpense}
                    onUpdate={updateExpense}
                />
            );
        case View.COMMERCIALS:
            return (
                <EntityManagement 
                    title="Gestión de Comerciales"
                    entityName="Comercial"
                    data={commercials}
                    columns={[
                        { key: 'name', label: 'Nombre' },
                        { key: 'email', label: 'Email' },
                        { key: 'phone', label: 'Teléfono' }
                    ]}
                    onAdd={commCRUD.add}
                    onDelete={commCRUD.delete}
                    onUpdate={commCRUD.update}
                />
            );
        case View.TYPES:
            return (
                <EntityManagement 
                    title="Tipos de Gasto"
                    entityName="Tipo"
                    data={expenseTypes}
                    columns={[
                        { key: 'name', label: 'Tipo de Gasto' }
                    ]}
                    onAdd={typeCRUD.add}
                    onDelete={typeCRUD.delete}
                    onUpdate={typeCRUD.update}
                />
            );
        default:
            return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen font-sans text-slate-800">
        <Sidebar currentView={currentView} onChangeView={setCurrentView} />
        
        <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </main>
    </div>
  );
};

export default App;
