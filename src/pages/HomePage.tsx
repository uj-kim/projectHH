import { useQuery } from '@tanstack/react-query';
// import { useAuth } from '@/hooks/useAuth';
import { getProducts } from '@/api/products';
import { getAllCategories } from '@/api/categories';
import ProductCard from '@/components/products/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { Database } from '@/types/database.types';

const HomePage: React.FC = () => {
    //카테고리 데이터 쿼리
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

    //상품 데이터 쿼리
    const {
        data: products,
        isLoading: isProductsLoading,
        isError: isProductsError,
        error: productsError,
    } = useQuery<Database['public']['Tables']['products']['Row'][], Error>({
        queryKey: ['products'], // 쿼리 키
        queryFn: getProducts, // 쿼리 함수
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 30 * 60 * 1000, // 30분
        refetchOnWindowFocus: false, // 창 포커스 시 재요청 비활성화
        enabled: true,
    });

    return (
        <div className="p-4">
            <header className="mb-6">
                {/* <h2>홈 페이지</h2> */}
                {/* {user ? (
                    <h2 className="text-2xl">환영합니다, {user.user_metadata.name}님!</h2>
                ) : (
                    <h2 className="text-2xl">로그인이 필요합니다.</h2>
                )} */}
            </header>

            <main>
                <section className="mb-12">
                    {/* 카테고리 섹션 */}
                    <h3 className="text-2xl font-bold text-center">Categories</h3>
                    {/* 카테고리 로딩 */}
                    {isCategoriesLoading && <p>카테고리 로딩중...</p>}
                    {/* 카테고리 에러 */}
                    {isCategoriesError && (
                        <p className="text-red-500 mb-4">
                            {categoriesError.message || '카테고리를 불러오지 못했습니다.'}
                        </p>
                    )}
                    {/* 카테고리 불러오기 성공 */}
                    {!isCategoriesLoading && !isCategoriesError && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {categories && categories.length > 0 ? (
                                categories.map((category) => (
                                    <CategoryCard key={category.category_id} category={category} />
                                ))
                            ) : (
                                <p>현재 표시할 카테고리가 없습니다.</p>
                            )}
                        </div>
                    )}
                </section>
                {/* 전체 상품 섹션 */}
                <section>
                    <h3 className="text-xl font-semibold mb-4">전체 상품 보기</h3>
                    {/* 로딩 상태 */}
                    {isProductsLoading && <p>로딩 중...</p>}

                    {/* 에러 상태 */}
                    {isProductsError && (
                        <p className="text-red-500 mb-4">
                            {productsError.message || '상품 목록을 불러오지 못했습니다.'}
                        </p>
                    )}

                    {/* 성공 상태 */}
                    {!isProductsLoading && !isProductsError && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
