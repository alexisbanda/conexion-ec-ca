
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, NewspaperIcon, UserGroupIcon, CalendarDaysIcon, BriefcaseIcon } from '../../icons';

const AdminLayout: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
        { href: '/admin/users', label: 'Usuarios', icon: <UserGroupIcon className="w-5 h-5" /> },
        { href: '/admin/ads', label: 'Anuncios', icon: <NewspaperIcon className="w-5 h-5" /> },
        { href: '/admin/events', label: 'Eventos', icon: <CalendarDaysIcon className="w-5 h-5" /> },
        { href: '/admin/news', label: 'Noticias', icon: <NewspaperIcon className="w-5 h-5" /> },
        { href: '/admin/services', label: 'Servicios', icon: <BriefcaseIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex flex-1 bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <nav className="flex-1 px-2 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.href}
                            className={`flex items-center px-4 py-2 text-lg rounded-md transition-colors ${
                                location.pathname === item.href
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {item.icon && <span className="mr-3">{item.icon}</span>}
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto">
                    <Outlet /> {/* Aquí se renderizarán las páginas anidadas */}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
