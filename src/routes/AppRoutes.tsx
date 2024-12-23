import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import routes from './config';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = true; // 인증 상태 로직
    return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {routes.map(({ path, element, protected: isProtected }, index) =>
                    isProtected ? (
                        <Route key={index} path={path} element={<ProtectedRoute>{element}</ProtectedRoute>} />
                    ) : (
                        <Route key={index} path={path} element={element} />
                    )
                )}
            </Routes>
        </Router>
    );
};

export default AppRoutes;
