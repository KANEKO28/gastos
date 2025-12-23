import React, { useState } from 'react';

interface Column {
  key: string;
  label: string;
}

interface EntityManagementProps {
  title: string;
  data: any[];
  columns: Column[];
  onAdd: (item: any) => void;
  onDelete: (id: string) => void;
  onUpdate: (item: any) => void;
  entityName: string; // e.g., 'Comercial' or 'Tipo'
}

const EntityManagement: React.FC<EntityManagementProps> = ({ 
  title, data, columns, onAdd, onDelete, onUpdate, entityName 
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, id: crypto.randomUUID() });
    setFormData({});
  };

  const handleUpdate = (id: string) => {
    onUpdate({ ...formData, id });
    setIsEditing(null);
    setFormData({});
  };

  const startEdit = (item: any) => {
    setIsEditing(item.id);
    setFormData({ ...item });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      {/* Form */}
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
         <h3 className="font-semibold text-lg text-gray-700">Añadir Nuevo {entityName}</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map(col => (
                <div key={col.key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{col.label}</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData[col.key] || ''}
                        onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                    />
                </div>
            ))}
         </div>
         <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium">
            Guardar
         </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {columns.map(col => (
                        <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {col.label}
                        </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                        {columns.map(col => (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {isEditing === item.id ? (
                                    <input 
                                        type="text"
                                        className="border rounded p-1 w-full"
                                        value={formData[col.key] || ''}
                                        onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                                    />
                                ) : (
                                    item[col.key]
                                )}
                            </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                             {isEditing === item.id ? (
                                <>
                                    <button onClick={() => handleUpdate(item.id)} className="text-green-600 hover:text-green-900">Guardar</button>
                                    <button onClick={() => setIsEditing(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                </>
                             ) : (
                                <>
                                    <button onClick={() => startEdit(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                </>
                             )}
                        </td>
                    </tr>
                ))}
                {data.length === 0 && (
                    <tr>
                        <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                            No hay registros.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntityManagement;
