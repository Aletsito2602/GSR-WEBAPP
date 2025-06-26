import React from 'react';
import { NavLink } from 'react-router-dom';
import './TabBar.css';

const TabBar = () => {
    const navItems = [
        { path: '/', label: 'Clases', icon: 'fas fa-chalkboard-teacher' },
        { path: '/streaming', label: 'Streaming', icon: 'fas fa-video' },
        { path: '/calendario', label: 'Calendario', icon: 'fas fa-calendar-alt' },
        { path: '/miembros', label: 'Miembros', icon: 'fas fa-users' },
        { path: '/niveles', label: 'Niveles', icon: 'fas fa-layer-group' },
        { path: '/about', label: 'Info', icon: 'fas fa-info-circle' },
    ];

    return (
        <nav className="tab-bar">
            {navItems.map(item => (
                <NavLink 
                    to={item.path} 
                    key={item.path}
                    className={({ isActive }) => isActive ? 'tab-item active' : 'tab-item'}
                    end // Use 'end' for the root path to avoid it being active on all child routes
                >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default TabBar; 