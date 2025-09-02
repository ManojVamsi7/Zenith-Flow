import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../App';
import { LayoutDashboardIcon, LibraryIcon, ListChecksIcon, MoonIcon, SunIcon } from './Icons';

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactElement<{ className?: string }>; label: string }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 ${isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
            }`
        }
    >
        {React.cloneElement(icon, { className: "w-6 h-6" })}
        <span className="text-xs font-medium">{label}</span>
    </NavLink>
);


const BottomNavBar = () => {
    const { theme, toggleTheme } = useContext(AppContext)!;
    
    return (
        <nav className="hidden">
            <div className="flex items-center justify-around h-full">
                <NavItem to="/" icon={<LayoutDashboardIcon />} label="Dashboard" />
                <NavItem to="/subjects" icon={<LibraryIcon />} label="Subjects" />
                <NavItem to="/tasks" icon={<ListChecksIcon />} label="Tasks" />
                <button onClick={toggleTheme} className="flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground hover:text-foreground">
                    {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
                    <span className="text-xs font-medium capitalize">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
            </div>
        </nav>
    );
};

export default BottomNavBar;