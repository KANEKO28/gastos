import React, { useState, useRef } from 'react';
import { Commercial, ExpenseType, Expense } from '../types';
import { analyzeReceipt } from '../services/geminiService';

interface ExpenseFormProps {
  commercials: Commercial[];
  expenseTypes: ExpenseType[];
  onSave: (expense: Expense) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ commercials, expenseTypes, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form State
  const [date, setDate] = useState('');
  const [creditor, setCreditor] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [selectedCommercial, setSelectedCommercial] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [observations, setObservations] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        processImageWithGemini(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageWithGemini = async (base64: string) => {
    setLoading(true);
    try {
      const typeNames = expenseTypes.map(t => t.name);
      const data = await analyzeReceipt(base64, typeNames);
      
      if (data.date) setDate(data.date);
      if (data.creditor) setCreditor(data.creditor);
      if (data.amount) setAmount(data.amount.toString());
      if (data.observations) setObservations(data.observations);
      
      // Try to match suggested type
      if (data.suggestedType) {
        const matchedType = expenseTypes.find(t => 
          t.name.toLowerCase() === data.suggestedType?.toLowerCase()
        );
        if (matchedType) setSelectedType(matchedType.id);
      }
    } catch (error) {
      alert("Error al analizar el ticket. Por favor complete los datos manualmente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview || !date || !creditor || !amount || !selectedCommercial || !selectedType) {
      alert("Por favor rellene todos los campos obligatorios y suba una imagen.");
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date,
      creditor,
      amount: parseFloat(amount),
      commercialId: selectedCommercial,
      typeId: selectedType,
      observations,
      receiptImage: imagePreview
    };

    onSave(newExpense);
    resetForm();
    alert("Gasto guardado correctamente");
  };

  const resetForm = () => {
    setImagePreview(null);
    setDate('');
    setCreditor('');
    setAmount('');
    setSelectedCommercial('');
    setSelectedType('');
    setObservations('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-2xl font-bold">Nuevo Gasto</h2>
        <p className="opacity-80">Sube el ticket y la IA rellenará los datos</p>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Image Upload */}
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Ticket</label>
            <div 
              className={`border-2 border-dashed rounded-xl h-96 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${imagePreview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
              ) : (
                <div className="p-6">
                  <span className="text-4xl mb-2 block">📷</span>
                  <p className="text-gray-500 font-medium">Haz clic para subir imagen</p>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            {loading && (
              <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg animate-pulse">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analizando con Gemini...</span>
              </div>
            )}
        </div>

        {/* Right Column: Form Data */}
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Comercial</label>
              <select 
                value={selectedCommercial} 
                onChange={(e) => setSelectedCommercial(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">Seleccione Comercial</option>
                {commercials.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Importe (€)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Acreedor</label>
              <input 
                type="text" 
                value={creditor} 
                onChange={(e) => setCreditor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Restaurante, Gasolinera..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Gasto</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Seleccione Tipo</option>
                {expenseTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones</label>
              <textarea 
                value={observations} 
                onChange={(e) => setObservations(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="Detalles adicionales..."
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              Guardar Gasto
            </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
