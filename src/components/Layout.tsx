import React from 'react';
import Header from '@/components/Header';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
