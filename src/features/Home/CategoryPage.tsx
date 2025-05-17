// src/pages/CategoryPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductsByCategory } from "@/api/products";
import ProductCard from "@/features/Products/ProductCard";
import { Database } from "@/types/database.types";
import { getCategoryById } from "@/api/categories";

const CategoryPage: React.FC = () => {
  // category_id가 string 또는 undefined일 수 있음을 명시
  const { category_id } = useParams<{ category_id?: string }>();

  //카테고리 페이지_ 해당 카테고리 정보 가져오기
  const {
    data: category,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useQuery<
    {
      category_id: string;
      category_name: string;
      category_image_url: string | null;
    },
    Error
  >({
    queryKey: ["category", category_id],
    queryFn: () => getCategoryById(category_id!),
    enabled: !!category_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: products,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useQuery<Database["public"]["Tables"]["products"]["Row"][], Error>({
    queryKey: ["products", category_id],
    queryFn: () => getProductsByCategory(category_id!),
    enabled: !!category_id, // category_id가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    refetchOnWindowFocus: false,
  });
  // category_id가 존재하지 않으면 에러 메시지 표시
  if (!category_id) {
    return (
      <p className="text-center text-red-500">유효하지 않은 카테고리입니다.</p>
    );
  }
  if (isCategoryLoading || isProductsLoading) {
    return <p className="text-center">상품을 로딩 중입니다...</p>;
  }

  if (isCategoryError) {
    return (
      <p className="text-center text-red-500">에러: {categoryError.message}</p>
    );
  }
  if (isProductsError) {
    return (
      <p className="text-center text-red-500">에러: {productsError.message}</p>
    );
  }

  return (
    <div className="p-4 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold">{category?.category_name}</h2>
      </header>
      <main>
        <section>
          {/* 상품 목록 표시 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))
            ) : (
              <p className="text-center">해당 카테고리에 상품이 없습니다.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CategoryPage;
