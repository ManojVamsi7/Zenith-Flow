import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Button } from './ui';
import { AnimatedMenuIcon, CircuitBoardIcon } from './Icons';

const Header = () => {
    const { isSidebarOpen, openSidebar, closeSidebar } = useContext(AppContext)!;

    const handleToggle = () => {
        if (isSidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-b border-border z-30 flex items-center justify-between px-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="Toggle Menu">
                <AnimatedMenuIcon isOpen={isSidebarOpen} />
            </Button>
            
            <div className="flex items-center gap-2">
                 <CircuitBoardIcon className="w-6 h-6 text-accent" />
                 <h1 className="text-xl font-bold font-display text-primary tracking-wide">Zenith Flow</h1>
            </div>

            <div className="w-10 h-10" />
        </header>
    );
};

export default Header;