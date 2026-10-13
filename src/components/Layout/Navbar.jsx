import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, Building } from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Building className="w-4 h-4 text-[#006552]" />
          <span className="font-medium text-slate-700">
            {user?.departamento || (isAdmin ? 'Dirección General' : 'Sin Departamento')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Badge de Rol */}
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
            isAdmin
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-teal-50 text-teal-700 border-teal-200'
          }`}
        >
          {isAdmin ? 'Administrador' : 'Operativo'}
        </span>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          {user?.foto_perfil ? (
            <img
              src={user.foto_perfil}
              alt={user.nombre}
              className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-300">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.nombre || user?.username}
            </span>
            <span className="text-[11px] text-slate-400">{user?.username}</span>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
