import React from 'react';
import Sidebar from '../Sidebar';

export default function AppLayout({
    children,
    activePage = 'billing',
    onNavigate = () => {},
    // legacy prop — ignored, activePage drives the sidebar now
    activeMenu,
}) {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 h-full bg-white border-r border-gray-200">
                <Sidebar activePage={activePage} onNavigate={onNavigate} />
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}