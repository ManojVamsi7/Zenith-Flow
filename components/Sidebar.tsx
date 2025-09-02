import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboardIcon, LibraryIcon, ListChecksIcon, CircuitBoardIcon, UserCircleIcon, SettingsIcon, ChevronsLeftIcon, MoonIcon, SunIcon } from './Icons';
import { AppContext } from '../App';
import { Button } from './ui';

const NavItem = ({ to, icon, label, isCollapsed }: { to: string; icon: React.ReactElement<{ className?: string }>; label: string; isCollapsed: boolean; }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 group border-l-4 ${
        isCollapsed ? 'md:justify-center' : ''
      } ${
        isActive
          ? 'border-accent bg-accent/10 text-accent font-semibold shadow-lg shadow-accent/20'
          : 'border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`
    }
  >
    {React.cloneElement(icon, { className: "w-5 h-5 flex-shrink-0"})}
    <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : ''}`}>{label}</span>
  </NavLink>
);

const Sidebar = () => {
    const { isSidebarOpen, closeSidebar, isSidebarCollapsed, toggleSidebarCollapse, userProfile, openSettings, theme, toggleTheme } = useContext(AppContext)!;

  return (
    <>
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/60 z-30 md:hidden animate-fade-in"
                onClick={closeSidebar}
                aria-hidden="true"
            />
        )}
        <aside
            className={`fixed top-0 left-0 h-full bg-card/80 backdrop-blur-lg border-r border-border z-40 w-[75%] max-w-[280px] flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}
        >
            <div className={`flex items-center gap-2 justify-center h-16 md:h-20 border-b border-border transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
                <CircuitBoardIcon className="w-7 h-7 text-accent flex-shrink-0" />
                <h1 className={`text-2xl font-bold font-display text-primary tracking-wide whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>Zenith Flow</h1>
            </div>
            
            <nav className="flex-grow p-4 space-y-1">
                <NavItem to="/" icon={<LayoutDashboardIcon />} label="Dashboard" isCollapsed={isSidebarCollapsed} />
                <NavItem to="/subjects" icon={<LibraryIcon />} label="Subjects" isCollapsed={isSidebarCollapsed} />
                <NavItem to="/tasks" icon={<ListChecksIcon />} label="Tasks" isCollapsed={isSidebarCollapsed} />
            </nav>
            
            <div className="p-4 border-t border-border">
                <div className="mb-4">
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? 
                            <MoonIcon className="w-5 h-5 flex-shrink-0" /> : 
                            <SunIcon className="w-5 h-5 flex-shrink-0" />
                        }
                        <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </button>
                </div>
                <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
                    <UserCircleIcon className="w-10 h-10 text-muted-foreground flex-shrink-0" />
                    <div className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                        <p className="font-semibold text-sm text-primary whitespace-nowrap">{userProfile.name}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{userProfile.title}</p>
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Settings" onClick={openSettings} className={`ml-auto transition-opacity duration-200 ${isSidebarCollapsed ? 'hidden' : 'inline-flex'}`}>
                        <SettingsIcon className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="hidden md:flex justify-center p-2 border-t">
                <Button variant="ghost" size="icon" onClick={toggleSidebarCollapse} aria-label="Toggle Sidebar">
                    <ChevronsLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                </Button>
            </div>
        </aside>
    </>
  );
};

export default Sidebar;