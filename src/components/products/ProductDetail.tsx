// src/components/ProductDetail.tsx

import React from 'react';
import { Database } from '@/types/database.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart } from '@/api/cart';
import { useAuth } from '@/hooks/useAuth'; // React Query 기반 인증 훅
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface ProductDetailProps {
    product: Database['public']['Tables']['products']['Row'];
    // favorite: boolean;
    // toggleFavorite: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
    // React Query를 사용하여 인증된 사용자 정보 가져오기
    const { data: user, isLoading: isAuthLoading, isError: isAuthError, error: authError } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Mutation 훅을 사용하여 addToCart API 호출 설정
    const mutation = useMutation({
        mutationFn: (quantity: number) => {
            if (!user) {
                throw new Error('사용자가 인증되지 않았습니다.');
            }
            return addToCart(user.id, product.product_id, quantity);
        },
        onSuccess: () => {
            // 캐시 무효화하여 장바구니 데이터를 다시 가져오도록 함
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: ['cart', user.id] });
            }
            toast.success('장바구니에 추가되었습니다!');
            navigate('/cart'); // 장바구니 페이지로 이동
        },
        onError: (error: Error) => {
            toast.error(`장바구니에 추가하지 못했습니다: ${error.message}`);
        },
    });

    // 수량 상태 관리 (기본값: 1)
    const [quantity, setQuantity] = React.useState<number>(1);

    // '장바구니에 추가' 버튼 클릭 핸들러
    const handleAddToCart = () => {
        if (isAuthLoading) {
            toast.info('인증 상태를 확인 중입니다.');
            return;
        }

        if (isAuthError) {
            toast.error(`인증 오류: ${authError?.message}`);
            return;
        }

        if (!user) {
            toast.error('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (quantity < 1) {
            toast.error('수량은 최소 1개 이상이어야 합니다.');
            return;
        }

        mutation.mutate(quantity);
    };

    // 인증 로딩 중일 때 로딩 메시지 표시
    if (isAuthLoading) return <div>인증 상태를 확인 중입니다...</div>;

    // 인증 오류가 발생했을 때 오류 메시지 표시
    if (isAuthError) return <div className="text-red-500">인증 오류: {authError?.message}</div>;

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* 상품 이미지 */}
            <div className="md:w-1/2">
                <div className="h-[50vh]">
                    <img
                        src={product.image_url || '/placeholder-image.png'}
                        alt={product.product_name}
                        className="w-full h-full object-cover rounded-md shadow-md"
                    />
                </div>
            </div>

            {/* 상품 정보 */}
            <div className="md:w-1/2 flex flex-col gap-4">
                {/* 가격 */}
                <p className="text-2xl font-bold text-green-600">₩{product.price.toLocaleString()}</p>

                {/* 상품 이름 */}
                <h2 className="text-3xl font-semibold">{product.product_name}</h2>

                {/* 수량 선택 */}
                <div className="flex items-center gap-2">
                    <label htmlFor="quantity" className="font-medium">
                        수량:
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-16 p-1 border rounded-md"
                    />
                </div>

                {/* 장바구니에 추가 버튼 */}
                <button
                    onClick={handleAddToCart}
                    className={`mt-2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                        mutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? '추가 중...' : '장바구니에 추가'}
                </button>

                {/* 상품 설명 */}
                <p className="mt-4 text-gray-700">{product.description}</p>
            </div>
        </div>
    );
};

export default ProductDetail;
