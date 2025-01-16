import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getProducts } from '@/api/products';
import ProductCard from '@/components/products/ProductCard';
import { Database } from '@/types/database.types';

const HomePage: React.FC = () => {
    const { data: user } = useAuth();
    const {
        data: products,
        isLoading,
        isError,
        error,
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
                <h2>홈 페이지</h2>
                {user ? (
                    <h2 className="text-2xl">환영합니다, {user.user_metadata.name}님!</h2>
                ) : (
                    <h2 className="text-2xl">로그인이 필요합니다.</h2>
                )}
            </header>

            <main>
                {/* 로딩 상태 */}
                {isLoading && <p>로딩 중...</p>}

                {/* 에러 상태 */}
                {isError && <p className="text-red-500 mb-4">{error.message || '상품 목록을 불러오지 못했습니다.'}</p>}

                {/* 성공 상태 */}
                {!isLoading && !isError && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products && products.length > 0 ? (
                            products.map((product) => <ProductCard key={product.product_id} product={product} />)
                        ) : (
                            <p>현재 판매 중인 상품이 없습니다.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default HomePage;
