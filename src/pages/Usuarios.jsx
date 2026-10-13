import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Save,
  AlertCircle,
  FileSignature,
  Sliders,
  CheckCircle2,
  Building,
} from 'lucide-react';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Usuario
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [idDepto, setIdDepto] = useState('');
  const [rol, setRol] = useState('Operativo');
  const [firma, setFirma] = useState(null);
  const [foto, setFoto] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Modal Asignaciones
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [usuarioAsignar, setUsuarioAsignar] = useState(null);
  const [asignados, setAsignados] = useState([]);
  const [noAsignados, setNoAsignados] = useState([]);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resUsers, resDeptos] = await Promise.all([
        api.get('/usuarios'),
        api.get('/departamentos'),
      ]);

      if (resUsers.data.success) {
        setUsuarios(resUsers.data.data || []);
      }
      if (resDeptos.data.success) {
        setDepartamentos(resDeptos.data.data || []);
        if (resDeptos.data.data?.length > 0) {
          setIdDepto(resDeptos.data.data[0].Id_departamento);
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalCrear = () => {
    setEditId(null);
    setNombre('');
    setCorreo('');
    setContrasena('');
    setRol('Operativo');
    setFirma(null);
    setFoto(null);
    setError('');
    setModalOpen(true);
  };

  const abrirModalEditar = (u) => {
    setEditId(u.Id_user);
    setNombre(u.Nombre);
    setCorreo(u.User);
    setContrasena('');
    setIdDepto(u.Id_departamento || (departamentos[0]?.Id_departamento ?? ''));
    setRol(u.Rol || 'Operativo');
    setFirma(null);
    setFoto(null);
    setError('');
    setModalOpen(true);
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('correo', correo);
      if (contrasena) formData.append('contrasena', contrasena);
      formData.append('departamento', idDepto);
      formData.append('rol', rol);
      if (firma) formData.append('firma', firma);
      if (foto) formData.append('foto', foto);

      if (editId) {
        formData.append('id', editId);
        await api.post(`/usuarios/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/usuarios', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setModalOpen(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar usuario');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombreUser) => {
    if (id === 1) {
      alert('El usuario principal no puede ser eliminado.');
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar al usuario "${nombreUser}"?`)) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      cargarDatos();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  // Asignaciones
  const abrirModalAsignaciones = async (u) => {
    setUsuarioAsignar(u);
    setModalAsignarOpen(true);
    setCargandoAsignaciones(true);

    try {
      const res = await api.post('/usuarios/getDocumentosAsignados', { id_usuario: u.Id_user });
      if (res.data.success) {
        setAsignados(res.data.asignados || []);
        setNoAsignados(res.data.noAsignados || []);
      }
    } catch (err) {
      console.error('Error al cargar asignaciones:', err);
    } finally {
      setCargandoAsignaciones(false);
    }
  };

  const asignarDoc = async (idDocumento) => {
    try {
      await api.post('/usuarios/setDocumentoIndividual', {
        id_documento: idDocumento,
        id_usuario: usuarioAsignar.Id_user,
      });
      abrirModalAsignaciones(usuarioAsignar);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const desasignarDoc = async (idDocumento) => {
    try {
      await api.post('/usuarios/delDocumentoIndividual', {
        id_documento: idDocumento,
        id_usuario: usuarioAsignar.Id_user,
      });
      abrirModalAsignaciones(usuarioAsignar);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#006552]" />
            Usuarios y Firmas Digitales
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administración de colaboradores, firmas digitales para plantillas de calidad y asignación de permisos.
          </p>
        </div>

        <button
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#006552] hover:bg-[#004d3e] text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-900/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Colaborador</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#006552] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto stroke-[1.5] mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Colaborador</th>
                  <th className="py-3.5 px-4 font-bold">Usuario / Correo</th>
                  <th className="py-3.5 px-4 font-bold">Departamento</th>
                  <th className="py-3.5 px-4 font-bold">Rol</th>
                  <th className="py-3.5 px-4 font-bold text-center">Firma</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.Id_user} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {u.Foto_perfil ? (
                          <img
                            src={u.Foto_perfil}
                            alt={u.Nombre}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-teal-800 text-teal-100 font-bold flex items-center justify-center text-xs">
                            {u.Nombre ? u.Nombre.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <span className="font-semibold text-slate-900">{u.Nombre}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{u.User}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.Departamento}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.Rol === 'Administrador'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {u.Rol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {u.Firma ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Registrada</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Sin firma</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => abrirModalAsignaciones(u)}
                          title="Gestionar Asignaciones de Documentos"
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalEditar(u)}
                          title="Editar Colaborador"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.Id_user !== 1 && (
                          <button
                            onClick={() => handleEliminar(u.Id_user, u.Nombre)}
                            title="Eliminar Colaborador"
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editId ? 'Editar Colaborador' : 'Nuevo Colaborador'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarUsuario} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="ej. Dra. María González"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usuario / Correo *
                  </label>
                  <input
                    type="text"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="ej. mgonzalez"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {editId ? 'Contraseña (vacío para mantener)' : 'Contraseña *'}
                  </label>
                  <input
                    type="password"
                    required={!editId}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rol en el Sistema
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
                  >
                    <option value="Operativo">Operativo (Solo consulta y lectura)</option>
                    <option value="Administrador">Administrador (Control total)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departamento de Adscripción *
                </label>
                <select
                  required
                  value={idDepto}
                  onChange={(e) => setIdDepto(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006552]"
                >
                  {departamentos.map((d) => (
                    <option key={d.Id_departamento} value={d.Id_departamento}>
                      {d.Departamento}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Firma Digital (.png con fondo transparente)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setFirma(e.target.files[0])}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:bg-teal-50 file:text-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Foto de Perfil (Opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFoto(e.target.files[0])}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:bg-teal-50 file:text-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
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

      {/* Modal Asignaciones */}
      {modalAsignarOpen && usuarioAsignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#006552]" />
                  Asignaciones de Documentos: {usuarioAsignar.Nombre}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestiona los procedimientos a los que este colaborador tiene acceso directo.
                </p>
              </div>
              <button
                onClick={() => setModalAsignarOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {cargandoAsignaciones ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-[#006552] animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">Cargando asignaciones...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Documentos Asignados */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-teal-800 mb-3 flex items-center justify-between">
                      <span>Asignados Actualmente ({asignados.length})</span>
                    </h4>

                    <div className="space-y-2 flex-1 overflow-y-auto max-h-80 pr-1">
                      {asignados.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No tiene documentos asignados.</p>
                      ) : (
                        asignados.map((item) => (
                          <div
                            key={item.Id_documento}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-teal-700">
                                {item.Clave_procedimiento}-{item.Clave_documento}
                              </span>
                              <div className="font-medium text-slate-800 truncate">{item.Documento}</div>
                            </div>
                            <button
                              onClick={() => desasignarDoc(item.Id_documento)}
                              className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded font-semibold text-[11px] shrink-0 transition"
                            >
                              Quitar
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Documentos Disponibles / No Asignados */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
                      Disponibles para Asignar ({noAsignados.length})
                    </h4>

                    <div className="space-y-2 flex-1 overflow-y-auto max-h-80 pr-1">
                      {noAsignados.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Todos los documentos están asignados.</p>
                      ) : (
                        noAsignados.map((item) => (
                          <div
                            key={item.Id_documento}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-slate-600">
                                {item.Clave_procedimiento}-{item.Clave_documento}
                              </span>
                              <div className="font-medium text-slate-800 truncate">{item.Documento}</div>
                            </div>
                            <button
                              onClick={() => asignarDoc(item.Id_documento)}
                              className="text-teal-700 hover:bg-teal-50 px-2 py-1 rounded font-semibold text-[11px] shrink-0 transition"
                            >
                              + Asignar
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
              <button
                onClick={() => setModalAsignarOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
