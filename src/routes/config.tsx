import { ReactNode } from 'react';
import HomePage from '@/pages/HomePage';
import Cart from '@/pages/CartPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ProductRegisterPage from '@/pages/ProductRegisterPage';
import MyPage from '@/pages/MyPage';
import ProductEditPage from '@/pages/ProductEditPage';
export interface RouteConfig {
    path: string; // 라우트 경로
    element: ReactNode; // 렌더링할 컴포넌트
    protected?: false; // 인증 필요 여부
}

const routes: RouteConfig[] = [
    { path: '/', element: <HomePage /> },
    // { path: '/auth', element: <Auth /> },
    { path: '/product/:id', element: <ProductDetailPage /> },
    { path: '/cart', element: <Cart /> },
    { path: '/productregister', element: <ProductRegisterPage /> },
    { path: '/products/edit/:productId', element: <ProductEditPage /> },
    // { path: '/purchase', element: <Purchase />, protected: true },
    { path: '/mypage', element: <MyPage /> },
];

export default routes;
