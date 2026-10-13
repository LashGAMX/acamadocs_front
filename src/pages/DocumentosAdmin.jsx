import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';

export const DocumentosAdmin = () => {
  const [documentos, setDocumentos] = useState([]);
  const [procedimientos, setProcedimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [codigoProc, setCodigoProc] = useState('0');
  const [clave, setClave] = useState('');
  const [titulo, setTitulo] = useState('');
  const [estadoCaducidad, setEstadoCaducidad] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resDocs, resProc] = await Promise.all([
        api.get('/documentos', {
          params: {
            codigo: codigoProc,
            clave: clave,
            titulo: titulo,
            estado: estadoCaducidad,
          },
        }),
        api.get('/procedimientos'),
      ]);

      if (resDocs.data.success) {
        setDocumentos(resDocs.data.data || []);
      }
      if (resProc.data.success) {
        setProcedimientos(resProc.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [codigoProc, estadoCaducidad]);

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarDatos();
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el documento "${nombre}"?`)) {
      return;
    }

    try {
      await api.delete(`/documentos/${id}`);
      setDocumentos((prev) => prev.filter((d) => d.Id_documento !== id));
    } catch (err) {
      alert('Error al eliminar el documento: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportarExcel = () => {
    const url = `${api.defaults.baseURL}/documentos/exportar/${codigoProc !== '0' ? codigoProc : ''}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#006552]" />
            Lista Maestra de Documentos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administración centralizada de especificaciones, manuales, formatos y procedimientos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportarExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Lista</span>
          </button>

          <Link
            to="/admin/documentos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#006552] hover:bg-[#004d3e] text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-900/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Documento</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <form onSubmit={handleBuscar} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Procedimiento */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Procedimiento
            </label>
            <select
              value={codigoProc}
              onChange={(e) => setCodigoProc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006552]"
            >
              <option value="0">Todos los Procedimientos</option>
              {procedimientos.map((p) => (
                <option key={p.Id_procedimiento} value={p.Id_procedimiento}>
                  {p.Clave_procedimiento} - {p.Procedimiento}
                </option>
              ))}
            </select>
          </div>

          {/* Clave */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Clave de Documento
            </label>
            <input
              type="text"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="ej. 001 o PO-02"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006552]"
            />
          </div>

          {/* Título */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Título o Nombre
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006552]"
            />
          </div>

          {/* Estado de Caducidad */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Estado de Caducidad
            </label>
            <div className="flex gap-2">
              <select
                value={estadoCaducidad}
                onChange={(e) => setEstadoCaducidad(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006552]"
              >
                <option value="">Cualquier Estado</option>
                <option value="1">Alerta (47 a 48 meses)</option>
                <option value="2">Caducado (&gt; 48 meses)</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Filtrar</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#006552] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Cargando documentos...</p>
          </div>
        ) : documentos.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No se encontraron documentos</p>
            <p className="text-sm mt-1">Prueba cambiando los filtros de búsqueda o registra un nuevo documento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Clave</th>
                  <th className="py-3.5 px-4 font-bold">Documento</th>
                  <th className="py-3.5 px-3 font-bold text-center">Rev.</th>
                  <th className="py-3.5 px-4 font-bold">Válido Desde</th>
                  <th className="py-3.5 px-4 font-bold">Última Mod.</th>
                  <th className="py-3.5 px-4 font-bold">Elaboró</th>
                  <th className="py-3.5 px-4 font-bold">Autorizó</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentos.map((doc) => {
                  const claveCompleta = `${doc.Clave_procedimiento}-${doc.Clave_documento}`;
                  return (
                    <tr key={doc.Id_documento} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                          {claveCompleta}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{doc.Documento}</div>
                        {doc.Descripcion && (
                          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{doc.Descripcion}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {doc.Numero_revision || '00'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        {doc.Valido_desde || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        {doc.Ultima_modificacion || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700">
                        {doc.Usuario_elabora || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700">
                        {doc.Usuario_autoriza || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/visor/${doc.Id_documento}`}
                            title="Ver Documento"
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/documentos/editar/${doc.Id_documento}`}
                            title="Editar Documento"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEliminar(doc.Id_documento, doc.Documento)}
                            title="Eliminar Documento"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
