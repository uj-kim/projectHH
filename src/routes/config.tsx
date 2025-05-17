// src/routes/config.tsx
import React, { lazy } from "react";
import HomePage from "@/features/Home/HomePage"; // 메인페이지는 일반 import

const CartPage = lazy(() => import("@/features/Cart/CartPage"));
const ProductDetailPage = lazy(
  () => import("@/features/Products/ProductDetailPage")
);
const CategoryPage = lazy(() => import("@/features/Home/CategoryPage"));
const SearchPage = lazy(() => import("@/features/Search/SearchPage"));
import WishlistPage from "@/features/Wishlist/WishlistPage"; // 위시리스트 페이지는 일반 import
const ProductRegisterPage = lazy(
  () => import("@/features/Products/ProductRegisterPage")
);
const ProductEditPage = lazy(
  () => import("@/features/Products/ProductEditPage")
);
const PaymentPage = lazy(() => import("@/features/Payments/PaymentPage"));
const MyPage = lazy(() => import("@/features/Mypage/MyPage"));

export interface RouteConfig {
  path: string; // 라우트 경로
  element: React.ReactNode; // 렌더링할 컴포넌트
  protected?: boolean; // 인증 필요 여부
}

const routes: RouteConfig[] = [
  { path: "/", element: <HomePage /> },
  { path: "/product/:id", element: <ProductDetailPage /> },
  { path: "/c/:category_id", element: <CategoryPage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/wishlist", element: <WishlistPage /> },
  { path: "/cart", element: <CartPage /> },
  {
    path: "/productregister",
    element: <ProductRegisterPage />,
    protected: true,
  },
  {
    path: "/products/edit/:productId",
    element: <ProductEditPage />,
    protected: true,
  },
  { path: "/purchase", element: <PaymentPage />, protected: true },
  { path: "/mypage", element: <MyPage />, protected: true },
];

export default routes;
