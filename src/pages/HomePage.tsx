// src/pages/HomePage.tsx
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/api/products';
import { getAllCategories } from '@/api/categories';
import ProductCard from '@/components/products/ProductCard';
import CategoryCard from '@/components/categories/CategoryCard';
import CategorySkeleton from '@/components/categories/CategorySkeleton';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { Database } from '@/types/database.types';

const HomePage: React.FC = () => {
    // 카테고리 데이터 쿼리
    const {
        data: categories,
        isLoading: isCategoriesLoading,
        isError: isCategoriesError,
        error: categoriesError,
    } = useQuery<Database['public']['Tables']['categories']['Row'][], Error>({
        queryKey: ['categories'],
        queryFn: getAllCategories,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: true,
    });

    // 상품 데이터 쿼리
    const {
        data: products,
        isLoading: isProductsLoading,
        isError: isProductsError,
        error: productsError,
    } = useQuery<Database['public']['Tables']['products']['Row'][], Error>({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: true,
    });

    return (
        <div className="p-4 min-h-screen">
            <header className="mb-8"></header>

            <main>
                <section className="mb-12">
                    {/* 카테고리 섹션 */}
                    <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">카 테 고 리</h3>

                    {isCategoriesError && (
                        <p className="text-red-500 mb-4 text-center">
                            {categoriesError.message || '카테고리를 불러오지 못했습니다.'}
                        </p>
                    )}

                    {isCategoriesLoading && (
                        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center">
                            {Array.from({ length: 8 }).map((_, idx) => (
                                <CategorySkeleton key={idx} />
                            ))}
                        </div>
                    )}

                    {!isCategoriesLoading && !isCategoriesError && (
                        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center">
                            {categories && categories.length > 0 ? (
                                categories.map((category) => (
                                    <CategoryCard key={category.category_id} category={category} />
                                ))
                            ) : (
                                <p className="text-center">현재 표시할 카테고리가 없습니다.</p>
                            )}
                        </div>
                    )}
                </section>
                {/* 전체 상품 섹션 */}
                <section>
                    <h3 className="text-xl font-semibold mb-4">전체 상품 보기</h3>

                    {isProductsError && (
                        <p className="text-red-500 mb-4">
                            {productsError.message || '상품 목록을 불러오지 못했습니다.'}
                        </p>
                    )}

                    {isProductsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, idx) => (
                                <ProductCardSkeleton key={idx} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {products && products.length > 0 ? (
                                products.map((product) => <ProductCard key={product.product_id} product={product} />)
                            ) : (
                                <p>현재 판매 중인 상품이 없습니다.</p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default HomePage;
