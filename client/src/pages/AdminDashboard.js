import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LineChart, Line, AreaChart, Area, 
    ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, 
    Defs, linearGradient, stop 
} from 'recharts';
import '../styles/global.css'; 

// --- ICONS (SVG) ---
const Icons = {
    Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Eye: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    File: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    Money: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
    Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, visitors: 0, generated: 0, revenue: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); 
    const [visitorChartData, setVisitorChartData] = useState([]);

    // --- CHECK ACCESS & LOAD DATA ---
    useEffect(() => {
        const storedAdmin = localStorage.getItem('adminUser');
        if (!storedAdmin) {
            navigate('/'); 
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        try {
            // Fetch Semua Data Sekaligus
            const [resStats, resUsers, resActivity, resTrans, resChart] = await Promise.all([
                fetch(`${API_URL}/admin/stats`),
                fetch(`${API_URL}/admin/users`),
                fetch(`${API_URL}/admin/activity`),
                fetch(`${API_URL}/admin/transactions`),
                fetch(`${API_URL}/admin/chart-stats`)
            ]);

            const statsData = await resStats.json();
            setStats(statsData);
            setRecentUsers(await resUsers.json());
            setActivities(await resActivity.json());
            setTransactions(await resTrans.json());

            // --- PROSES DATA GRAFIK ---
            const rawChartData = await resChart.json();
            
            // Format data dari DB agar sesuai tampilan Chart
            const formattedChartData = rawChartData.map(item => {
                const d = new Date(item.date);
                return {
                    day: d.toLocaleDateString('id-ID', { weekday: 'short' }), // Sen, Sel
                    fullDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }),
                    visits: item.visit_count
                };
            });

            // Jika data kosong (awal deploy), isi array kosong agar tidak error
            if (formattedChartData.length === 0) {
                const today = new Date();
                setVisitorChartData([{
                    day: today.toLocaleDateString('id-ID', { weekday: 'short' }),
                    fullDate: today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }),
                    visits: 0
                }]);
            } else {
                setVisitorChartData(formattedChartData);
            }

        } catch (error) {
            console.error("Dashboard Error:", error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        navigate('/');
    };

    return (
        <div className="main dark-theme" style={{ height: '100vh', overflow: 'hidden', background: '#0a0510' }}>
            <div className="maincontainer" style={{ flexDirection: 'column', height: '100%' }}>
                
                {/* --- HEADER --- */}
                <header className="header" style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                    padding: '0 30px', 
                    background: 'rgba(10, 5, 16, 0.8)',
                    height: '65px'
                }}>
                    <div className="header-brand" style={{ gap: '12px' }}>
                        <div style={{ background: 'var(--primary-gradient)', padding: '6px', borderRadius: '6px', display: 'flex', boxShadow: '0 2px 10px rgba(124, 58, 237, 0.3)' }}>
                            <Icons.Dashboard />
                        </div>
                        <span className="brand-text" style={{ 
                            fontSize: '16px', letterSpacing: '1px', color: '#fff', 
                            background: 'none', WebkitTextFillColor: 'white', fontWeight: '600' 
                        }}>
                            Admin<span style={{color: 'var(--primary)'}}>Panel</span>
                        </span>
                    </div>
                    
                    <div className="header-actions" style={{ gap: '15px' }}>
                        <button onClick={() => navigate('/')} className="btn-secondary" style={{ 
                            width: 'auto', padding: '8px 14px', fontSize: '12px', borderRadius: '6px',
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)'
                        }}>
                            <Icons.Home /> Website
                        </button>
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <button onClick={handleLogout} className="btn-secondary" style={{ 
                            width: 'auto', padding: '8px 14px', fontSize: '12px', borderRadius: '6px',
                            color: '#ff4757', border: '1px solid rgba(255, 71, 87, 0.2)', background: 'rgba(255, 71, 87, 0.05)'
                        }}>
                            <Icons.Logout /> Logout
                        </button>
                    </div>
                </header>

                {/* --- DASHBOARD BODY (SCROLLABLE) --- */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
                    
                    {/* BAGIAN 1: KARTU STATISTIK*/}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                        gap: '20px', 
                        marginBottom: '30px' 
                    }}>
                        {/* Pengunjung */}
                        <StatCard title="Total Visitors" value={stats.visitors} icon={<Icons.Eye />} color="#8b5cf6" />
                        
                        {/* User Terdaftar */}
                        <StatCard title="Registered Users" value={stats.users} icon={<Icons.Users />} color="#ec4899" /> 
                        
                        {/* Sertifikat */}
                        <StatCard title="Certificates" value={stats.generated} icon={<Icons.File />} color="#06b6d4" /> 
                        
                        {/* Pendapatan */}
                        <StatCard title="Revenue" value={formatCurrency(stats.revenue)} icon={<Icons.Money />} color="#10b981" /> 
                    </div>

                    {/* BAGIAN 2: GRAFIK VISITOR */}
                    <div style={{ 
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '16px', 
                        padding: '25px', 
                        marginBottom: '30px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff', fontFamily: 'Montserrat' }}>
                                Visitor Analytics
                            </h3>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                                Realtime Data
                            </div>
                        </div>

                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={visitorChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis 
                                        dataKey="day" 
                                        stroke="var(--text-muted)" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="var(--text-muted)" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={(value) => `${value}`}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#8b5cf6' }}
                                        formatter={(value) => [`${value} Visitors`, 'Traffic']}
                                        labelStyle={{ color: '#aaa', marginBottom: '5px' }}
                                        labelFormatter={(label, payload) => {
                                            if (payload && payload.length > 0) return payload[0].payload.fullDate;
                                            return label;
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="visits" 
                                        stroke="#8b5cf6" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorVisits)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BAGIAN 3: TABEL DATA (LOGS, USERS, TRANSACTIONS) */}
                    <div className="auth-card" style={{ 
                        width: '100%', maxWidth: '100%', 
                        padding: '0', overflow: 'hidden',
                        height: 'auto', minHeight: '400px',
                        background: 'rgba(20, 20, 30, 0.6)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        
                        {/* NAVIGATION TABS */}
                        <div style={{ 
                            display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                            background: 'rgba(0,0,0,0.2)', padding: '0 20px' 
                        }}>
                            <TabButton label="Activity Logs" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                            <TabButton label="Users Database" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                            <TabButton label="Transactions" isActive={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
                        </div>

                        {/* TABLE DATA */}
                        <div style={{ padding: '0', overflowX: 'auto' }}>
                            
                            {/* TAB 1: LOGS */}
                            {activeTab === 'overview' && (
                                <TableContainer>
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>User Identity</th>
                                            <th>Action Type</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activities.map((log, i) => (
                                            <tr key={i}>
                                                <td style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>
                                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                                </td>
                                                <td>
                                                    <div style={{fontWeight:'600', color:'var(--text-main)', fontSize:'13px'}}>{log.user_name}</div>
                                                    <div style={{fontSize:'11px', color:'var(--text-muted)'}}>{log.user_email}</div>
                                                </td>
                                                <td>
                                                    <Badge type={log.activity_type === 'visit' ? 'neutral' : 'success'}>
                                                        {log.activity_type.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td style={{color:'var(--text-muted)', fontSize:'13px'}}>{log.details}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </TableContainer>
                            )}

                            {/* TAB 2: USERS */}
                            {activeTab === 'users' && (
                                <TableContainer>
                                    <thead>
                                        <tr>
                                            <th>Full Name</th>
                                            <th>Email Address</th>
                                            <th>Role</th>
                                            <th>Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentUsers.map((u, i) => (
                                            <tr key={i}>
                                                <td style={{fontWeight:'600', color:'var(--text-main)'}}>{u.name}</td>
                                                <td style={{color:'var(--text-muted)'}}>{u.email}</td>
                                                <td>
                                                    <Badge type={u.role === 'admin' ? 'warning' : 'info'}>{u.role.toUpperCase()}</Badge>
                                                </td>
                                                <td style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>
                                                    {new Date(u.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </TableContainer>
                            )}

                            {/* TAB 3: TRANSACTIONS */}
                            {activeTab === 'transactions' && (
                                <TableContainer>
                                    <thead>
                                        <tr>
                                            <th>Order Ref</th>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((t, i) => (
                                            <tr key={i}>
                                                <td style={{fontFamily:'monospace', color:'var(--primary)', fontSize:'12px'}}>{t.order_id}</td>
                                                <td>
                                                    <div style={{fontWeight:'600', fontSize:'13px'}}>{t.customer_name || 'Guest'}</div>
                                                    <div style={{fontSize:'11px', color:'var(--text-muted)'}}>{t.customer_email}</div>
                                                </td>
                                                <td style={{fontWeight:'600'}}>{formatCurrency(t.amount)}</td>
                                                <td>
                                                    <Badge type={t.status === 'settlement' || t.status === 'capture' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'}>
                                                        {t.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td style={{fontSize:'12px', color:'var(--text-muted)'}}>{new Date(t.created_at).toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </TableContainer>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STYLED COMPONENTS ---

const StatCard = ({ title, value, icon, color }) => (
    <div style={{ 
        background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '12px', 
        padding: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        cursor: 'default'
    }}>
        <div style={{ 
            width: '50px', height: '50px', 
            background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.1)`, 
            borderRadius: '10px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color 
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>{title}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px', fontFamily: 'Montserrat, sans-serif' }}>{value}</div>
        </div>
    </div>
);

const TabButton = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        style={{
            background: 'none', border: 'none', 
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            padding: '16px 20px', fontSize: '13px', fontWeight: isActive ? '700' : '500',
            borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s',
            letterSpacing: '0.3px'
        }}
    >
        {label}
    </button>
);

const Badge = ({ type, children }) => {
    let bg, color, border;
    switch(type) {
        case 'success': bg = 'rgba(16, 185, 129, 0.1)'; color = '#34d399'; border = 'rgba(16, 185, 129, 0.2)'; break;
        case 'warning': bg = 'rgba(245, 158, 11, 0.1)'; color = '#fbbf24'; border = 'rgba(245, 158, 11, 0.2)'; break;
        case 'danger': bg = 'rgba(239, 68, 68, 0.1)'; color = '#f87171'; border = 'rgba(239, 68, 68, 0.2)'; break;
        case 'info': bg = 'rgba(59, 130, 246, 0.1)'; color = '#60a5fa'; border = 'rgba(59, 130, 246, 0.2)'; break;
        default: bg = 'rgba(255, 255, 255, 0.05)'; color = '#9ca3af'; border = 'rgba(255, 255, 255, 0.1)';
    }
    return (
        <span style={{ 
            background: bg, color: color, border: `1px solid ${border}`,
            padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' 
        }}>
            {children}
        </span>
    );
};

const TableContainer = ({ children }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <style>{`
            th { text-align: left; padding: 14px 24px; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 700; }
            td { padding: 14px 24px; color: var(--text-main); border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
            tr:hover td { background: rgba(255,255,255,0.02); }
        `}</style>
        {children}
    </table>
);

export default AdminDashboard;