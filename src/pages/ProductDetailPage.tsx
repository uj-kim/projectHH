// src/pages/ProductDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '@/api/products';
import { Database } from '@/types/database.types';
import ProductDetail from '@/components/products/ProductDetail';
import { useQuery } from '@tanstack/react-query';
import ReviewSection from '@/components/Review';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // 상품 상세 정보 가져오기 using useQuery
    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useQuery<Database['public']['Tables']['products']['Row'], Error>({
        queryKey: ['product', id],
        queryFn: () => getProductById(id!),
        enabled: !!id, // id가 존재할 때만 실행
        retry: 1, // 실패 시 재시도 횟수
        staleTime: 5 * 60 * 1000, // 데이터 신선도 설정 (5분)
    });

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div className="text-red-500">오류 발생: {error.message}</div>;
    if (!product) return <div>상품을 찾을 수 없습니다.</div>;

    return (
        <div className="p-6">
            <button onClick={() => navigate(-1)} className="mb-4 text-blue-500 hover:underline">
                ← 뒤로가기
            </button>
            <ProductDetail product={product} />
            <div className="mt-12">
                <ReviewSection productId={product.product_id} />
            </div>
        </div>
    );
};

export default ProductDetailPage;
