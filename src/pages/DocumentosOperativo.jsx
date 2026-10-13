import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  CheckSquare,
  Search,
  Eye,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const DocumentosOperativo = () => {
  const [documentos, setDocumentos] = useState([]);
  const [procedimientos, setProcedimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [codigoProc, setCodigoProc] = useState('0');
  const [clave, setClave] = useState('');
  const [titulo, setTitulo] = useState('');

  const cargarMisDocumentos = async () => {
    setLoading(true);
    try {
      const [resDocs, resProc] = await Promise.all([
        api.get('/documentos/mis-documentos', {
          params: {
            codigo: codigoProc,
            clave: clave,
            titulo: titulo,
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
      console.error('Error al cargar mis documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisDocumentos();
  }, [codigoProc]);

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarMisDocumentos();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-[#006552]" />
          Mis Documentos Asignados
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Procedimientos y formatos asignados a tu puesto de trabajo. Asegúrate de revisar aquellos marcados como pendientes.
        </p>
      </div>

      {/* Filter */}
      <form onSubmit={handleBuscar} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Clave de Documento
            </label>
            <input
              type="text"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="ej. 001"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006552]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Título o Nombre
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006552]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Grid or Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#006552] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Cargando tus documentos...</p>
          </div>
        ) : documentos.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckSquare className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No tienes documentos asignados</p>
            <p className="text-sm mt-1">Comunícate con el administrador para solicitar acceso a tus procedimientos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Estado</th>
                  <th className="py-3.5 px-4 font-bold">Clave</th>
                  <th className="py-3.5 px-4 font-bold">Nombre del Documento</th>
                  <th className="py-3.5 px-4 font-bold">Válido Desde</th>
                  <th className="py-3.5 px-4 font-bold">Última Revisión</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentos.map((doc) => {
                  const claveCompleta = `${doc.Clave_procedimiento}-${doc.Clave_documento}`;
                  const requiereRevision = doc.Estado_revision == 1;

                  return (
                    <tr
                      key={doc.Id_documento}
                      className={`hover:bg-slate-50/70 transition ${
                        requiereRevision ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {requiereRevision ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300/70 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Requiere Revisión
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Revisado
                          </span>
                        )}
                      </td>
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
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        {doc.Valido_desde || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        {doc.Ultima_modificacion || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/visor/${doc.Id_documento}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            requiereRevision
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{requiereRevision ? 'Revisar Ahora' : 'Consultar'}</span>
                        </Link>
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
