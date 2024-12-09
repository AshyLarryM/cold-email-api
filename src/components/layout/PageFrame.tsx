import React from 'react';
import { Navbar } from './Navbar';

interface PageFrameProps {
    children: React.ReactNode;
    showNavbar?: boolean,
    showFooter?: boolean,
    className?: string,
}

export default function PageFrame({ showNavbar, showFooter, children, className = "",}: PageFrameProps) {
    return (
        <div className={`flex flex-col h-screen ${className}`}>
            {showNavbar && <Navbar />}
            <main>
                {children}
            </main>
        </div>
    );
};


