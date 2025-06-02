// src/pages/SearchPage.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "@/api/products";
import ProductCard from "@/features/Products/ProductCard";
import { Database } from "@/types/database.types";

const useQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchPage: React.FC = () => {
  const queryParams = useQueryParams();
  const searchQuery = queryParams.get("q") || "";

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery<Database["public"]["Tables"]["products"]["Row"][], Error>({
    queryKey: ["searchProducts", searchQuery],
    queryFn: () => searchProducts(searchQuery),
    enabled: !!searchQuery.trim(), // 검색어가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    refetchOnWindowFocus: false,
  });

  return (
    <div className="p-4 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold">
          "{searchQuery}"에 대한 검색 결과
        </h2>
      </header>
      <main>
        <section>
          {/* 로딩 상태 */}
          {isLoading && <p className="text-center">검색 중...</p>}

          {/* 에러 상태 */}
          {isError && (
            <p className="text-center text-red-500">에러: {error.message}</p>
          )}

          {/* 검색 결과 표시 */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))
              ) : (
                <p className="text-center">
                  "{searchQuery}"에 해당하는 상품이 없습니다.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SearchPage;
