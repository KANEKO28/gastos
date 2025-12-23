import React, { useState, useMemo } from 'react';
import { Expense, Commercial, ExpenseType, FilterState } from '../types';
import { editReceiptImage } from '../services/geminiService';

interface HistoryViewProps {
  expenses: Expense[];
  commercials: Commercial[];
  expenseTypes: ExpenseType[];
  onDelete: (id: string) => void;
  onUpdate: (expense: Expense) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ expenses, commercials, expenseTypes, onDelete, onUpdate }) => {
  const [filters, setFilters] = useState<FilterState>({
    commercialId: '',
    typeId: '',
    year: '',
    month: ''
  });

  const [selectedImage, setSelectedImage] = useState<Expense | null>(null);
  const [editingImage, setEditingImage] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);

  // Derive available years from data
  const years = useMemo(() => Array.from(new Set(expenses.map(e => e.date.substring(0, 4)))).sort().reverse(), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchCommercial = filters.commercialId ? expense.commercialId === filters.commercialId : true;
      const matchType = filters.typeId ? expense.typeId === filters.typeId : true;
      const matchYear = filters.year ? expense.date.startsWith(filters.year) : true;
      const matchMonth = filters.month ? expense.date.substring(5, 7) === filters.month : true;
      return matchCommercial && matchType && matchYear && matchMonth;
    });
  }, [expenses, filters]);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Acreedor', 'Comercial', 'Tipo', 'Importe', 'Observaciones'];
    const rows = filteredExpenses.map(e => {
        const commName = commercials.find(c => c.id === e.commercialId)?.name || 'Desconocido';
        const typeName = expenseTypes.find(t => t.id === e.typeId)?.name || 'Desconocido';
        return [e.date, e.creditor, commName, typeName, e.amount.toFixed(2), e.observations].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gastos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditImage = async () => {
    if (!selectedImage || !editPrompt) return;
    setIsProcessingEdit(true);
    try {
      const newImage = await editReceiptImage(selectedImage.receiptImage, editPrompt);
      const updatedExpense = { ...selectedImage, receiptImage: newImage };
      onUpdate(updatedExpense);
      setSelectedImage(updatedExpense); // Update preview
      setEditPrompt('');
      alert("Imagen editada con éxito.");
    } catch (error) {
      alert("Error editando la imagen.");
    } finally {
      setIsProcessingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Gastos</h2>
        <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
            <span>📥</span> Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <select 
            value={filters.commercialId} 
            onChange={e => setFilters(prev => ({...prev, commercialId: e.target.value}))}
            className="border rounded p-2"
        >
            <option value="">Todos los Comerciales</option>
            {commercials.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select 
            value={filters.typeId} 
            onChange={e => setFilters(prev => ({...prev, typeId: e.target.value}))}
            className="border rounded p-2"
        >
            <option value="">Todos los Tipos</option>
            {expenseTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select 
            value={filters.year} 
            onChange={e => setFilters(prev => ({...prev, year: e.target.value}))}
            className="border rounded p-2"
        >
            <option value="">Todos los Años</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select 
            value={filters.month} 
            onChange={e => setFilters(prev => ({...prev, month: e.target.value}))}
            className="border rounded p-2"
        >
            <option value="">Todos los Meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acreedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comercial</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <button onClick={() => setSelectedImage(expense)} className="relative group">
                                <img src={expense.receiptImage} alt="Ticket" className="h-10 w-10 object-cover rounded border" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition rounded flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs">🔍</span>
                                </div>
                            </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.creditor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {commercials.find(c => c.id === expense.commercialId)?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {expenseTypes.find(t => t.id === expense.typeId)?.name}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{expense.amount.toFixed(2)} €</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => onDelete(expense.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                        </td>
                    </tr>
                ))}
                {filteredExpenses.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                            No se encontraron gastos con estos filtros.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Detalle del Ticket</h3>
                    <button onClick={() => { setSelectedImage(null); setEditingImage(false); }} className="text-gray-500 hover:text-black">✕</button>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-100 flex justify-center">
                   <img src={selectedImage.receiptImage} alt="Ticket Full" className="max-w-full object-contain" />
                </div>
                
                {/* AI Edit Section */}
                <div className="p-4 border-t bg-gray-50">
                    {!editingImage ? (
                        <button 
                            onClick={() => setEditingImage(true)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                            ✨ Editar imagen con IA
                        </button>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <input 
                                type="text" 
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="Ej: 'Aumentar contraste', 'Eliminar fondo'"
                                className="flex-1 border rounded px-3 py-2 text-sm"
                            />
                            <button 
                                onClick={handleEditImage}
                                disabled={isProcessingEdit || !editPrompt}
                                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isProcessingEdit ? 'Procesando...' : 'Generar'}
                            </button>
                            <button onClick={() => setEditingImage(false)} className="text-gray-500 text-sm hover:underline">Cancelar</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
