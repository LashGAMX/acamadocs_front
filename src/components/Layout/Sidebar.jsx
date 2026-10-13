import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  FilePlus2,
  Building2,
  Users,
  CheckSquare,
  LogOut,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();

  const adminLinks = [
    { name: 'Documentos (Admin)', to: '/admin/documentos', icon: FileText },
    { name: 'Nuevo Documento', to: '/admin/documentos/nuevo', icon: FilePlus2 },
    { name: 'Departamentos', to: '/admin/departamentos', icon: Building2 },
    { name: 'Usuarios y Firmas', to: '/admin/usuarios', icon: Users },
  ];

  const userLinks = [
    { name: 'Mis Documentos', to: '/documentos', icon: CheckSquare },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-screen border-r border-slate-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 bg-gradient-to-r from-[#006552] to-[#0d9488] shadow-md">
        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          <FolderOpen className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-white tracking-wide">AcamaDocs</span>
          <span className="text-[10px] text-teal-100 font-medium tracking-wider uppercase">
            Gestión Documental
          </span>
        </div>
      </div>

      {/* User Badge in Sidebar */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-3">
          {user?.foto_perfil ? (
            <img
              src={user.foto_perfil}
              alt={user.nombre}
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/50 shadow"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-teal-800/80 text-teal-100 font-bold flex items-center justify-center border border-teal-600/40">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate">{user?.nombre || user?.username}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`inline-block w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-teal-400'}`}></span>
              <span className="truncate">{isAdmin ? 'Administrador' : (user?.departamento || 'Operativo')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <div className="pb-2">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Administración
            </div>
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#006552] text-white shadow-md shadow-teal-900/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-teal-400" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        <div className="pt-2">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            Operaciones
          </div>
          {userLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#006552] text-white shadow-md shadow-teal-900/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-teal-400" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
