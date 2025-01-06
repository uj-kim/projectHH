import { ReactNode } from 'react';
import Home from '@/pages/Home';
import Cart from '@/pages/Cart';
import ProductDetail from '@/pages/ProductDetail';
import ProductRegisterPage from '@/pages/ProductRegisterPage';
import MyPage from '@/pages/MyPage';
import ProductEditPage from '@/pages/ProductEditPage';
export interface RouteConfig {
    path: string; // 라우트 경로
    element: ReactNode; // 렌더링할 컴포넌트
    protected?: false; // 인증 필요 여부
}

const routes: RouteConfig[] = [
    { path: '/', element: <Home /> },
    // { path: '/auth', element: <Auth /> },
    { path: '/product/:id', element: <ProductDetail /> },
    { path: '/cart', element: <Cart /> },
    { path: '/productregister', element: <ProductRegisterPage /> },
    { path: '/products/edit/:productId', element: <ProductEditPage /> },
    // { path: '/purchase', element: <Purchase />, protected: true },
    { path: '/mypage', element: <MyPage /> },
];

export default routes;
