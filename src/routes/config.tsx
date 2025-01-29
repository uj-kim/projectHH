import { ReactNode } from 'react';
import HomePage from '@/pages/HomePage';
import CartPage from '@/pages/CartPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ProductRegisterPage from '@/pages/ProductRegisterPage';
import MyPage from '@/pages/MyPage';
import ProductEditPage from '@/pages/ProductEditPage';
import PaymentPage from '@/pages/PaymentPage';
import CategoryPage from '@/pages/CategoryPage';
export interface RouteConfig {
    path: string; // 라우트 경로
    element: ReactNode; // 렌더링할 컴포넌트
    protected?: boolean; // 인증 필요 여부
}

const routes: RouteConfig[] = [
    { path: '/', element: <HomePage /> },
    // { path: '/auth', element: <Auth /> },
    { path: '/product/:id', element: <ProductDetailPage /> },
    { path: '/c/:category_id', element: <CategoryPage /> },
    { path: '/cart', element: <CartPage /> },
    { path: '/productregister', element: <ProductRegisterPage />, protected: true },
    { path: '/products/edit/:productId', element: <ProductEditPage />, protected: true },
    { path: '/purchase', element: <PaymentPage />, protected: true },
    { path: '/mypage', element: <MyPage />, protected: true },
];

export default routes;
