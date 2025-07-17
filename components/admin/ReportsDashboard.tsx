
import React, { useEffect, useState, useMemo } from 'react';
import { User, CommunityServiceItem, EventItem, UserStatus, ServiceStatus } from '../../types';
import { getAllUsers } from '../../services/userService';
import { getAllServicesForAdmin } from '../../services/directoryService';
import { getAllEventsForAdmin } from '../../services/eventService';
import { UserGroupIcon, BriefcaseIcon, CalendarDaysIcon, ClockIcon } from '../icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'; // Sugerencia de librería

// --- Componentes de UI Internos ---

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-ecuador-yellow">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-ecuador-yellow-light mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-ecuador-blue mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);


const ReportsDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [services, setServices] = useState<CommunityServiceItem[]>([]);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersData, servicesData, eventsData] = await Promise.all([
                    getAllUsers(),
                    getAllServicesForAdmin(),
                    getAllEventsForAdmin()
                ]);
                setUsers(usersData);
                setServices(servicesData);
                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching report data:", error);
                // Aquí podrías usar un toast para notificar el error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- KPIs Calculados con useMemo ---
    const kpis = useMemo(() => {
        const usersPending = users.filter(u => u.status === UserStatus.PENDIENTE).length;
        const servicesPending = services.filter(s => s.status === ServiceStatus.PENDIENTE).length;
        const upcomingEvents = events.filter(e => e.date.toDate() > new Date()).length;

        return {
            totalUsers: users.length,
            usersPending,
            totalServices: services.length,
            servicesPending,
            totalEvents: events.length,
            upcomingEvents
        };
    }, [users, services, events]);

    // --- Datos para Gráficos con useMemo ---
    const usersByCityData = useMemo(() => {
        const cityCounts: { [key: string]: number } = {};
        users.forEach(user => {
            const city = user.city || 'Desconocida';
            cityCounts[city] = (cityCounts[city] || 0) + 1;
        });
        return Object.entries(cityCounts)
            .map(([name, count]) => ({ name, 'Usuarios': count }))
            .sort((a, b) => b.Usuarios - a.Usuarios)
            .slice(0, 10); // Mostrar top 10 ciudades
    }, [users]);
    
    const servicesByCategoryData = useMemo(() => {
        const categoryCounts: { [key: string]: number } = {};
        services.forEach(service => {
            const category = service.category || 'Otra';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    }, [services]);

    const COLORS = ['#0033A0', '#FFD100', '#EC0000', '#5DADE2', '#F5B041', '#58D68D'];

    if (loading) {
        return <div className="p-6">Cargando reportes...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 font-montserrat">Dashboard de Reportes</h1>

            {/* --- KPIs en la parte superior --- */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard 
                        title="Total de Usuarios" 
                        value={kpis.totalUsers} 
                        icon={<UserGroupIcon className="w-8 h-8 text-ecuador-blue" />}
                        description={`${kpis.usersPending} usuarios pendientes de aprobación`}
                    />
                    <KPICard 
                        title="Total de Servicios" 
                        value={kpis.totalServices} 
                        icon={<BriefcaseIcon className="w-8 h-8 text-ecuador-blue" />}
                        description={`${kpis.servicesPending} servicios pendientes de aprobación`}
                    />
                    <KPICard 
                        title="Total de Eventos" 
                        value={kpis.totalEvents} 
                        icon={<CalendarDaysIcon className="w-8 h-8 text-ecuador-blue" />}
                        description={`${kpis.upcomingEvents} eventos próximos`}
                    />
                     <KPICard 
                        title="Usuarios Nuevos (Mes)" 
                        value="12" // Dato de ejemplo, requeriría lógica de fechas
                        icon={<ClockIcon className="w-8 h-8 text-ecuador-blue" />}
                        description="+5% vs mes anterior"
                    />
                </div>
            </section>
            
            {/* --- Gráficos en el centro --- */}
            <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <ChartContainer title="Distribución de Usuarios por Ciudad (Top 10)">
                        <BarChart data={usersByCityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} interval={0} fontSize={12} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Usuarios" fill="#0033A0" />
                        </BarChart>
                    </ChartContainer>
                </div>
                <div className="lg:col-span-2">
                   <ChartContainer title="Servicios por Categoría">
                        <PieChart>
                            <Pie
                                data={servicesByCategoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                fontSize={12}
                            >
                                {servicesByCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ChartContainer>
                </div>
            </section>

             {/* --- Listas en la parte inferior --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-ecuador-blue mb-4">Últimos Usuarios Pendientes</h3>
                    <ul className="space-y-3">
                        {users.filter(u => u.status === UserStatus.PENDIENTE).slice(0, 5).map(user => (
                            <li key={user.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                <span>{user.name} ({user.email})</span>
                                <span className="text-gray-500">{user.city || 'N/A'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-ecuador-blue mb-4">Últimos Servicios Pendientes</h3>
                     <ul className="space-y-3">
                        {services.filter(s => s.status === ServiceStatus.PENDIENTE).slice(0, 5).map(service => (
                            <li key={service.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                <span>{service.serviceName}</span>
                                <span className="text-gray-500">por {service.contactName}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default ReportsDashboard;