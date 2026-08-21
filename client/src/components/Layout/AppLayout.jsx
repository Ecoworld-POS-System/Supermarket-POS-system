import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout({
    children,
    activeMenu = 'Bill History',
    breadcrumb = ['EGOTECH WORLD', 'Bill History'],
}) {
    return (
        <div className="app-layout">
            {/* Sidebar */}
            <Sidebar activeMenu={activeMenu} />

            {/* Main Application Area */}
            <div className="main-wrapper">
                {/* Header */}
                <Header breadcrumb={breadcrumb} />

                {/* Page Content */}
                <main className="main-content">
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
}