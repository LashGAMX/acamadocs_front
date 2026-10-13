import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  User,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
} from 'lucide-react';

export const VisorDocumento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [htmlOficial, setHtmlOficial] = useState('');

  const cargarDocumento = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/visor/${id}`);
      if (res.data.success) {
        setDocumento(res.data.data);
        if (res.data.data.tipo_visualizador === 'html') {
          try {
            const resHtml = await api.get(`/visor/${id}/html`, { responseType: 'text' });
            setHtmlOficial(typeof resHtml.data === 'string' ? resHtml.data : '');
          } catch (errHtml) {
            console.error('Error al cargar formato oficial HTML:', errHtml);
            setHtmlOficial('');
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar documento para visor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocumento();
  }, [id]);

  const puedeDescargar = Boolean(isAdmin || documento?.can_download);

  // Prevenir atajos de teclado para guardar o imprimir para usuarios que no sean administradores
  useEffect(() => {
    if (!puedeDescargar) {
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'S', 'P'].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [puedeDescargar]);

  const handleConfirmarRevision = async () => {
    setConfirmando(true);
    try {
      const res = await api.post(`/visor/${id}/confirmar`);
      if (res.data.success) {
        setMensajeExito('¡Has confirmado la lectura y revisión de este procedimiento!');
        setDocumento((prev) => ({
          ...prev,
          estado_revision: 0,
          estado_lectura: 1,
        }));
      }
    } catch (err) {
      alert('Error al confirmar revisión: ' + (err.response?.data?.message || err.message));
    } finally {
      setConfirmando(false);
    }
  };

  const handleDescargaAdmin = async (e) => {
    e.preventDefault();
    if (!puedeDescargar) {
      alert('No tienes permisos para descargar documentos.');
      return;
    }

    setDescargando(true);
    try {
      const response = await api.get(`/visor/${id}/descargar`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${documento?.clave || 'documento'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al descargar el documento.');
    } finally {
      setDescargando(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-[#006552] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Cargando visor del documento...</p>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-800">Documento no encontrado</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  const requiereRevision = documento.estado_revision === 1;
  const pdfViewerSrc = puedeDescargar
    ? documento.url
    : `${documento.url}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 md:-m-8">
      {/* Top Controls Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-teal-50 text-teal-800 border border-teal-200">
                {documento.clave}
              </span>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">
                Rev. {documento.revision}
              </span>
              <h1 className="text-base font-bold text-slate-800 tracking-tight truncate max-w-md sm:max-w-xl">
                {documento.titulo}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span>Elaboró: <strong className="text-slate-600">{documento.elaborado_por}</strong></span>
              <span>Autorizó: <strong className="text-slate-600">{documento.autorizado_por}</strong></span>
              <span>Modificado: <strong className="text-slate-600">{documento.ultima_modificacion || '—'}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Confirmar revisión y Descarga (Solo Admin) */}
        <div className="flex items-center gap-3">
          {mensajeExito && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {mensajeExito}
            </span>
          )}

          {requiereRevision && (
            <button
              onClick={handleConfirmarRevision}
              disabled={confirmando}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-900/10 transition active:scale-95 disabled:opacity-50"
            >
              {confirmando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Lectura y Revisión</span>
                </>
              )}
            </button>
          )}

          {/* Botón de descarga reservado exclusivamente para Administradores */}
          {puedeDescargar && documento.url ? (
            <button
              onClick={handleDescargaAdmin}
              disabled={descargando}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006552] border border-emerald-200 text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
              title="Descargar documento (Facultad de Administrador)"
            >
              {descargando ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Descargar (Admin)</span>
            </button>
          ) : (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-500 rounded-lg border border-slate-200 select-none"
              title="Por políticas de seguridad, los documentos no se pueden descargar"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Solo Lectura</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Document Viewer Container */}
      <div
        className="flex-1 bg-slate-200 p-2 sm:p-4 overflow-hidden relative select-none"
        onContextMenu={(e) => {
          if (!puedeDescargar) {
            e.preventDefault();
          }
        }}
      >
        {documento.tipo_visualizador === 'pdf' && documento.url ? (
          <iframe
            src={pdfViewerSrc}
            title={documento.titulo}
            className="w-full h-full rounded-xl bg-white border border-slate-300 shadow-sm"
          />
        ) : documento.tipo_visualizador === 'html' && htmlOficial ? (
          <iframe
            srcDoc={htmlOficial}
            sandbox=""
            title={documento.titulo}
            className="w-full h-full rounded-xl bg-white border border-slate-300 shadow-sm max-w-5xl mx-auto block"
          />
        ) : documento.tipo_visualizador === 'html' && documento.contenido_html ? (
          <div className="w-full h-full overflow-y-auto bg-white rounded-xl p-8 max-w-4xl mx-auto border border-slate-300 shadow-sm">
            <div
              className="prose max-w-none text-slate-800"
              dangerouslySetInnerHTML={{ __html: documento.contenido_html }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-slate-300 p-8 text-center max-w-md mx-auto shadow-sm">
            <FileText className="w-16 h-16 text-teal-600 mb-3" />
            <h3 className="font-bold text-slate-800 text-base">Documento {documento.tipo_nombre}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {puedeDescargar
                ? `Plantilla o archivo adjunto (${documento.tipo_nombre}). Puedes descargarlo directamente.`
                : `Plantilla o archivo adjunto (${documento.tipo_nombre}). La descarga de archivos está restringida para el personal operativo.`}
            </p>
            {puedeDescargar && documento.url ? (
              <button
                onClick={handleDescargaAdmin}
                disabled={descargando}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006552] hover:bg-[#004d3e] text-white text-xs font-semibold rounded-xl shadow transition disabled:opacity-50"
              >
                {descargando ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Descargar Documento (Admin)</span>
              </button>
            ) : !puedeDescargar ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Descarga restringida a Administradores</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">Sin archivo adjunto disponible</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
