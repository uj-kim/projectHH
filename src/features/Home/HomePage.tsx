// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getProducts } from "@/api/products";
import { getAllCategories } from "@/api/categories";
import ProductCard from "@/features/Products/ProductCard";
import CategoryCard from "@/features/Home/CategoryCard";
import { Database } from "@/types/database.types";

const HomePage: React.FC = () => {
  // 카테고리 데이터 쿼리 (기존 방식)
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery<Database["public"]["Tables"]["categories"]["Row"][], Error>({
    queryKey: ["categories"],
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // useInfiniteQuery를 사용해 상품 데이터를 페이지네이션 방식으로 불러옴.
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Database["public"]["Tables"]["products"]["Row"][]>({
    queryKey: ["products"],
    queryFn: ({ pageParam = 0 }) => getProducts(pageParam as number, 8),
    getNextPageParam: (lastPage, pages) => {
      // 마지막 페이지의 상품 수가 8개이면 다음 페이지가 있다고 가정
      return lastPage.length === 8 ? pages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Intersection Observer를 활용해 스크롤 시 추가 데이터를 불러옴.
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className=" min-h-screen">
      <header className="mb-8"></header>
      <main>
        <section className="mb-12">
          {/* 카테고리 섹션 */}
          <h3 className="ml-2 text-2xl font-semibold text-left text-gray-800">
            카테고리별 쇼핑
          </h3>
          {isCategoriesError && (
            <p className="text-red-500 mb-4 text-center">
              {categoriesError.message || "카테고리를 불러오지 못했습니다."}
            </p>
          )}
          {!isCategoriesLoading && !isCategoriesError && (
            <div className="flex flex-wrap justify-between w-full max-w-10xl mx-auto">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <CategoryCard
                    key={category.category_id}
                    category={category}
                  />
                ))
              ) : (
                <p className="text-center">현재 표시할 카테고리가 없습니다.</p>
              )}
            </div>
          )}
        </section>
        {/* 전체 상품 섹션 */}
        <section>
          <h3 className="text-2xl font-semibold text-left text-gray-800">
            전체 상품 보기
          </h3>
          {isProductsError && (
            <p className="text-red-500 mb-4">
              {productsError.message || "상품 목록을 불러오지 못했습니다."}
            </p>
          )}
          {isProductsLoading && !productsData ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {productsData?.pages.map((page, pageIndex) =>
                page.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))
              )}
            </div>
          )}
          {/* 스크롤이 하단에 도달하면 추가 데이터를 불러오기 위한 sentinel 요소 */}
          <div ref={ref} className="mt-4 text-center">
            {isFetchingNextPage && <p>Loading more...</p>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
