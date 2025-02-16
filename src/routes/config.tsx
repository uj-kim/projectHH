// src/routes/config.tsx
import React, { lazy } from 'react';
import HomePage from '@/pages/HomePage'; // 메인페이지는 일반 import

const CartPage = lazy(() => import('@/pages/CartPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ProductRegisterPage = lazy(() => import('@/pages/ProductRegisterPage'));
const ProductEditPage = lazy(() => import('@/pages/ProductEditPage'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
const MyPage = lazy(() => import('@/pages/MyPage'));

export interface RouteConfig {
    path: string; // 라우트 경로
    element: React.ReactNode; // 렌더링할 컴포넌트
    protected?: boolean; // 인증 필요 여부
}

const routes: RouteConfig[] = [
    { path: '/', element: <HomePage /> },
    { path: '/product/:id', element: <ProductDetailPage /> },
    { path: '/c/:category_id', element: <CategoryPage /> },
    { path: '/search', element: <SearchPage /> },
    { path: '/cart', element: <CartPage /> },
    { path: '/productregister', element: <ProductRegisterPage />, protected: true },
    { path: '/products/edit/:productId', element: <ProductEditPage />, protected: true },
    { path: '/purchase', element: <PaymentPage />, protected: true },
    { path: '/mypage', element: <MyPage />, protected: true },
];

export default routes;
