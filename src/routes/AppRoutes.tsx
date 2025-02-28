// src/routes/AppRoutes.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './config';
import Layout from '@/components/Layout';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import ScrollTop from '@/components/ScrollTop';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { data: user, isLoading } = useAuth();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
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
            <ScrollTop />
            <Routes>
                <Route path="/" element={<Layout />}>
                    {routes.map(({ path, element, protected: isProtected }, index) => {
                        const routeElement =
                            path === '/' ? element : <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
                        return (
                            <Route
                                key={index}
                                path={path === '/' ? '/' : path.replace(/^\/+/, '')}
                                element={isProtected ? <ProtectedRoute>{routeElement}</ProtectedRoute> : routeElement}
                            />
                        );
                    })}
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoutes;
