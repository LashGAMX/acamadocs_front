import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';

export const Departamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargarDepartamentos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departamentos');
      if (res.data.success) {
        setDepartamentos(res.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const abrirModalCrear = () => {
    setEditId(null);
    setNombre('');
    setDescripcion('');
    setError('');
    setModalOpen(true);
  };

  const abrirModalEditar = (dep) => {
    setEditId(dep.Id_departamento);
    setNombre(dep.Departamento);
    setDescripcion(dep.Descripcion || '');
    setError('');
    setModalOpen(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');

    try {
      if (editId) {
        await api.post(`/departamentos/upDepartamentos`, {
          id_departamento: editId,
          departamento: nombre,
          descripcion: descripcion,
        });
      } else {
        await api.post(`/departamentos/setDepartamentos`, {
          departamento: nombre,
          descripcion: descripcion,
        });
      }

      setModalOpen(false);
      cargarDepartamentos();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombreDep) => {
    if (id === 1) {
      alert('El departamento de Administración no puede ser eliminado.');
      return;
    }

    if (
      !window.confirm(
        `¿Eliminar el departamento "${nombreDep}"? Los usuarios serán transferidos automáticamente al departamento predeterminado.`
      )
    ) {
      return;
    }

    try {
      await api.post(`/departamentos/delDepartamentos`, { id_departamento: id });
      cargarDepartamentos();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#006552]" />
            Departamentos y Áreas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de las áreas funcionales de la organización que poseen o revisan procedimientos.
          </p>
        </div>

        <button
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#006552] hover:bg-[#004d3e] text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-900/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Departamento</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#006552] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Cargando departamentos...</p>
          </div>
        ) : departamentos.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No hay departamentos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-bold">ID</th>
                  <th className="py-3.5 px-4 font-bold">Departamento</th>
                  <th className="py-3.5 px-4 font-bold">Descripción</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departamentos.map((dep) => (
                  <tr key={dep.Id_departamento} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #{dep.Id_departamento}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {dep.Departamento}
                      {dep.Id_departamento === 1 && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
                          Principal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {dep.Descripcion || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => abrirModalEditar(dep)}
                          title="Editar Departamento"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {dep.Id_departamento !== 1 && (
                          <button
                            onClick={() => handleEliminar(dep.Id_departamento, dep.Departamento)}
                            title="Eliminar Departamento"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editId ? 'Editar Departamento' : 'Nuevo Departamento'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Aseguramiento de Calidad"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Objetivo o funciones principales del área..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#006552] hover:bg-[#004d3e] text-white text-sm font-semibold rounded-xl shadow transition disabled:opacity-50"
                >
                  {guardando ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editId ? 'Actualizar' : 'Guardar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
