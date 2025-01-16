// src/routes/AppRoutes.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './config';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoginModal from '@/components/LoginModal';
import React, { useState, useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { data: user, isLoading } = useAuth();
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        //로직조건
        if (!user && !isLoading) {
            setShowModal(true);
        }
    }, [user, isLoading]);

    const handleCloseModal = () => {
        setShowModal(false);
    };
    return (
        <>
            {user ? children : null}
            {showModal && <LoginModal onClose={handleCloseModal} />}
        </>
    );
};

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {routes.map(({ path, element, protected: isProtected }, index) => (
                        <Route
                            key={index}
                            path={path === '/' ? '/' : path.replace(/^\/+/, '')} // nested routes 경로 조정
                            element={isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
                        />
                    ))}
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoutes;
