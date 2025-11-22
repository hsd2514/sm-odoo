import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, ArrowRightLeft, LayoutDashboard, Settings, LogOut, FileText, History, Truck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/operations', label: 'Operations', icon: ArrowRightLeft },
    { path: '/move-history', label: 'Move History', icon: History },
    { path: '/vendors', label: 'Vendors', icon: Truck },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[var(--color-neo-white)] border-r-2 border-[var(--color-neo-dark)] flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b-2 border-[var(--color-neo-dark)]">
        <h1 className="text-2xl font-black uppercase">StockMaster</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 p-3 font-bold border-2 border-transparent hover:border-[var(--color-neo-dark)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                isActive ? 'bg-[var(--color-neo-accent)] border-[var(--color-neo-dark)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''
              }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t-2 border-[var(--color-neo-dark)]">
        <button 
          onClick={logout}
          className="flex items-center gap-3 p-3 w-full font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
