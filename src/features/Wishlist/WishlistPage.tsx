// src/pages/WishlistPage.tsx
import React from "react";
import { useWishlist } from "@/stores/wishlistStore";
import ProductCard from "@/features/Products/ProductCard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WishlistPage: React.FC = () => {
  const { wishlists } = useWishlist();
  const { data: user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold">로그인이 필요합니다.</h2>
        <Button
          onClick={() => navigate("/")}
          className="mt-4 p-2 bg-blue-500 text-white rounded-md"
        >
          메인 페이지로 이동
        </Button>
      </div>
    );
  }

  // 현재 로그인한 사용자의 위시리스트 조회
  const userWishlist = wishlists[user.id] || [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">위시리스트</h1>
      {userWishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {userWishlist.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              showCartButton={true}
            />
          ))}
        </div>
      ) : (
        <p>위시리스트에 담긴 상품이 없습니다.</p>
      )}
    </div>
  );
};

export default WishlistPage;
