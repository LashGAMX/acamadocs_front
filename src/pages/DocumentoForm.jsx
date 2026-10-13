import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  FileText,
  Save,
  ArrowLeft,
  Upload,
  Calendar,
  Layers,
  Building2,
  UserCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';

export const DocumentoForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [procedimientos, setProcedimientos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState('');

  // Campos del formulario
  const [claveProc, setClaveProc] = useState('');
  const [claveDoc, setClaveDoc] = useState('');
  const [documento, setDocumento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idTipo, setIdTipo] = useState('1'); // 1=PDF, 2=HTML, 3=WORD
  const [numeroRevision, setNumeroRevision] = useState('00');
  const [validoDesde, setValidoDesde] = useState(new Date().toISOString().split('T')[0]);
  const [ultimaModificacion, setUltimaModificacion] = useState(new Date().toISOString().split('T')[0]);
  const [idElabora, setIdElabora] = useState('');
  const [idAutoriza, setIdAutoriza] = useState('');
  const [deptosSeleccionados, setDeptosSeleccionados] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [contenidoHtml, setContenidoHtml] = useState('');

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resProc, resTipos, resUsers, resDeptos] = await Promise.all([
          api.get('/procedimientos'),
          api.get('/tipos-documentos'),
          api.get('/usuarios'),
          api.get('/departamentos'),
        ]);

        if (resProc.data.success) {
          setProcedimientos(resProc.data.data || []);
          if (!isEditing && resProc.data.data?.length > 0) {
            setClaveProc(resProc.data.data[0].Id_procedimiento);
          }
        }
        if (resTipos.data.success) {
          setTipos(resTipos.data.data || []);
        }
        if (resUsers.data.success) {
          setUsuarios(resUsers.data.data || []);
          if (!isEditing && resUsers.data.data?.length > 0) {
            setIdElabora(resUsers.data.data[0].Id_user);
            setIdAutoriza(resUsers.data.data[0].Id_user);
          }
        }
        if (resDeptos.data.success) {
          setDepartamentos(resDeptos.data.data || []);
        }

        // Si es edición, cargar el documento existente
        if (isEditing) {
          const resDoc = await api.get(`/documentos/${id}`);
          if (resDoc.data.success) {
            const d = resDoc.data.data;
            setClaveProc(d.Id_procedimiento);
            setClaveDoc(d.Clave_documento);
            setDocumento(d.Documento);
            setDescripcion(d.Descripcion || '');
            setIdTipo(String(d.Id_tipo));
            setNumeroRevision(d.Numero_revision || '00');
            setValidoDesde(d.Valido_desde || '');
            setUltimaModificacion(d.Ultima_modificacion || '');
            setIdElabora(d.Id_elabora || '');
            setIdAutoriza(d.Id_autoriza || '');
            setDeptosSeleccionados(d.Departamentos || []);
            setContenidoHtml(d.Contenido || '');
          }
        }
      } catch (err) {
        console.error('Error cargando catálogos:', err);
        setError('Error al cargar datos del formulario');
      } finally {
        setLoadingInit(false);
      }
    };

    cargarCatalogos();
  }, [id, isEditing]);

  const toggleDepartamento = (deptoId) => {
    setDeptosSeleccionados((prev) =>
      prev.includes(deptoId)
        ? prev.filter((item) => item !== deptoId)
        : [...prev, deptoId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('clave_procedimiento', claveProc);
      formData.append('clave_documento', claveDoc);
      formData.append('documento', documento);
      formData.append('descripcion', descripcion);
      formData.append('id_tipo', idTipo);
      formData.append('numero_revision', numeroRevision);
      formData.append('valido_desde', validoDesde);
      formData.append('ultima_modificacion', ultimaModificacion);
      formData.append('id_elabora', idElabora);
      formData.append('id_autoriza', idAutoriza);

      deptosSeleccionados.forEach((dep) => {
        formData.append('id_departamento[]', dep);
      });

      if (idTipo === '2') {
        formData.append('contenido_url', contenidoHtml);
      } else if (archivo) {
        formData.append('archivo', archivo);
      }

      if (isEditing) {
        formData.append('id_documento', id);
        await api.post(`/documentos/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/documentos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/admin/documentos');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error al guardar el documento');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#006552] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/documentos"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {isEditing ? 'Modificar Documento' : 'Registrar Nuevo Documento'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura los metadatos, revisiones, firmas y archivo adjunto del procedimiento.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identificación y Clave */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-4 h-4 text-[#006552]" />
            1. Identificación y Clave
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Procedimiento Perteneciente *
              </label>
              <select
                required
                value={claveProc}
                onChange={(e) => setClaveProc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              >
                {procedimientos.map((p) => (
                  <option key={p.Id_procedimiento} value={p.Id_procedimiento}>
                    {p.Clave_procedimiento} - {p.Procedimiento}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clave / Código del Documento *
              </label>
              <input
                type="text"
                required
                value={claveDoc}
                onChange={(e) => setClaveDoc(e.target.value)}
                placeholder="ej. 001 o PO-01"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre Oficial del Documento *
              </label>
              <input
                type="text"
                required
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="ej. Procedimiento para el Control de Información Documentada"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción / Alcance
              </label>
              <textarea
                rows="2"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve resumen de la finalidad o alcance del documento..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Card 2: Metadatos, Revisiones y Fechas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-[#006552]" />
            2. Revisiones y Vigencia
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Revisión *
              </label>
              <input
                type="text"
                required
                value={numeroRevision}
                onChange={(e) => setNumeroRevision(e.target.value)}
                placeholder="ej. 00, 01, 02"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Válido Desde *
              </label>
              <input
                type="date"
                required
                value={validoDesde}
                onChange={(e) => setValidoDesde(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Última Modificación *
              </label>
              <input
                type="date"
                required
                value={ultimaModificacion}
                onChange={(e) => setUltimaModificacion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Elaboró (Firma 1) *
              </label>
              <select
                required
                value={idElabora}
                onChange={(e) => setIdElabora(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              >
                {usuarios.map((u) => (
                  <option key={u.Id_user} value={u.Id_user}>
                    {u.Nombre} ({u.Departamento})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Autorizó (Firma 2) *
              </label>
              <select
                required
                value={idAutoriza}
                onChange={(e) => setIdAutoriza(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
              >
                {usuarios.map((u) => (
                  <option key={u.Id_user} value={u.Id_user}>
                    {u.Nombre} ({u.Departamento})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Formato del Archivo y Subida */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload className="w-4 h-4 text-[#006552]" />
            3. Archivo o Contenido del Documento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: '1', title: 'Archivo PDF (.pdf)', desc: 'Documento en formato estándar PDF' },
              { id: '3', title: 'Plantilla Word (.docx)', desc: 'Documento Word con firmas dinámicas' },
              { id: '2', title: 'Editor Web (HTML)', desc: 'Texto enriquecido directo en la plataforma' },
            ].map((t) => (
              <label
                key={t.id}
                className={`p-4 border rounded-xl cursor-pointer flex flex-col transition ${
                  idTipo === t.id
                    ? 'border-[#006552] bg-teal-50/40 ring-1 ring-[#006552]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                  <input
                    type="radio"
                    name="tipoDoc"
                    value={t.id}
                    checked={idTipo === t.id}
                    onChange={(e) => setIdTipo(e.target.value)}
                    className="text-[#006552] focus:ring-[#006552]"
                  />
                  <span>{t.title}</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 pl-5">{t.desc}</span>
              </label>
            ))}
          </div>

          {idTipo === '2' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contenido del Procedimiento (Editor Interno)
              </label>
              <RichTextEditor
                value={contenidoHtml}
                onChange={setContenidoHtml}
                documentoMeta={{
                  documento,
                  claveCompleta: `${procedimientos.find((p) => String(p.Id_procedimiento) === String(claveProc))?.Clave_procedimiento || ''}-${claveDoc}`,
                  validoDesde,
                  ultimaModificacion,
                  numeroRevision,
                  departamentoNombre: departamentos.find(
                    (d) => d.Id_departamento !== 1 && deptosSeleccionados.includes(d.Id_departamento)
                  )?.Departamento,
                  elaboraNombre: usuarios.find((u) => String(u.Id_user) === String(idElabora))?.Nombre,
                  autorizaNombre: usuarios.find((u) => String(u.Id_user) === String(idAutoriza))?.Nombre,
                }}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEditing ? 'Reemplazar Archivo (Opcional)' : 'Seleccionar Archivo *'}
              </label>
              <input
                type="file"
                accept={idTipo === '1' ? '.pdf' : '.docx'}
                required={!isEditing}
                onChange={(e) => setArchivo(e.target.files[0])}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              <span className="text-xs text-slate-400 mt-1 block">
                {idTipo === '1' ? 'Soporta archivos .pdf hasta 15MB' : 'Soporta plantillas .docx hasta 15MB'}
              </span>
            </div>
          )}
        </div>

        {/* Card 4: Departamentos Asignados */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-[#006552]" />
            4. Departamentos a los que Aplica
          </h2>
          <p className="text-xs text-slate-500">
            Los usuarios pertenecientes a estos departamentos tendrán acceso a este documento en su menú operativo.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {departamentos.map((dep) => {
              const checked = deptosSeleccionados.includes(dep.Id_departamento) || dep.Id_departamento === 1;
              const isReadOnly = dep.Id_departamento === 1;

              return (
                <label
                  key={dep.Id_departamento}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 cursor-pointer transition ${
                    checked
                      ? 'bg-teal-50/50 border-teal-300 text-teal-900 font-semibold'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                  } ${isReadOnly ? 'opacity-80 cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isReadOnly}
                    onChange={() => toggleDepartamento(dep.Id_departamento)}
                    className="w-4 h-4 text-[#006552] rounded focus:ring-[#006552]"
                  />
                  <span className="truncate">{dep.Departamento}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/documentos"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006552] hover:bg-[#004d3e] text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-900/20 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Actualizar Documento' : 'Guardar Documento'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
