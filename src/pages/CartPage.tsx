// src/pages/CartPage.tsx
import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCartItems, removeCartItem, updateCartItemQuantity } from '@/api/cart';
import { useAuth } from '@/hooks/useAuth';
import CartItem from '@/components/CartItem';
import { Database } from '@/types/database.types';
import { toast } from 'react-toastify';

const PAGE_SIZE = 3;

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: user } = useAuth();
    const observerRef = useRef<IntersectionObserver | null>(null);

    // user 여부에 상관없이 Hook 호출(쿼리는 enabled 옵션으로 user 없을 때 자동 비활성화)
    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
        (Database['public']['Tables']['order_products']['Row'] & {
            product: Database['public']['Tables']['products']['Row'];
        })[],
        Error
    >({
        queryKey: ['cart', user?.id],
        queryFn: ({ pageParam = 0 }) =>
            // user가 없으면 빈 배열을 반환하도록 안전하게 처리
            user ? getCartItems(user.id, pageParam as number, PAGE_SIZE) : Promise.resolve([]),
        // 현재 페이지의 항목 수가 PAGE_SIZE와 같으면 다음 페이지가 있을 가능성이 있음
        getNextPageParam: (lastPage, pages) => {
            return lastPage.length === PAGE_SIZE ? pages.length : undefined;
        },
        initialPageParam: 0,
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });

    const removeMutation = useMutation({
        mutationFn: (productId: string) => removeCartItem(user!.id, productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
            toast.success('장바구니에서 제거되었습니다.');
        },
        onError: (error: Error) => {
            toast.error(`장바구니에서 제거하지 못했습니다: ${error.message}`);
        },
    });

    const updateQuantityMutation = useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
            updateCartItemQuantity(user!.id, productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
            toast.success('수량이 업데이트되었습니다.');
        },
        onError: (error: Error) => {
            toast.error(`수량 업데이트에 실패했습니다: ${error.message}`);
        },
    });

    const handleRemove = (productId: string) => {
        removeMutation.mutate(productId);
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        if (quantity < 1) {
            toast.error('수량은 최소 1개 이상이어야 합니다.');
            return;
        }
        updateQuantityMutation.mutate({ productId, quantity });
    };

    // 전체 페이지의 데이터를 평탄화하여 총 금액 계산
    const allCartItems = data?.pages.flat() || [];
    const totalPrice = allCartItems.reduce((total, item) => total + item.product.price * item.order_quantity, 0);

    // Intersection Observer를 사용하여 스크롤 감지
    const loadMoreRef = useCallback(
        (node: HTMLDivElement) => {
            if (isFetchingNextPage) return;
            if (observerRef.current) observerRef.current.disconnect();
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            });
            if (node) observerRef.current.observe(node);
        },
        [isFetchingNextPage, fetchNextPage, hasNextPage]
    );

    return (
        <div className="p-6">
            {/* user가 없으면 로그인 필요 UI를 표시 */}
            {!user ? (
                <div>
                    <h2 className="text-2xl font-semibold">로그인이 필요합니다.</h2>
                    <button onClick={() => navigate('/')} className="mt-4 p-2 bg-blue-500 text-white rounded-md">
                        메인 페이지로 이동
                    </button>
                </div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-6">장바구니</h1>

                    {isLoading && <p>로딩 중...</p>}
                    {isError && <p className="text-red-500 mb-4">오류 발생: {error.message}</p>}

                    {allCartItems.length > 0 ? (
                        <div className="space-y-4">
                            {data?.pages.map((page, pageIndex) => (
                                <React.Fragment key={pageIndex}>
                                    {page.map((item) => (
                                        <CartItem
                                            key={`${item.order_id}-${item.product_id}`}
                                            item={item}
                                            onRemove={() => handleRemove(item.product_id)}
                                            onQuantityChange={(quantity) =>
                                                handleQuantityChange(item.product_id, quantity)
                                            }
                                        />
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* 총 금액 및 결제하기 버튼 */}
                            <div className="mt-6 flex justify-between items-center">
                                <p className="text-xl font-semibold">총 금액: ₩{totalPrice.toLocaleString()}</p>
                                <button
                                    onClick={() => navigate('/purchase')}
                                    className="p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                >
                                    결제하기
                                </button>
                            </div>

                            {/* 스크롤 감지를 위한 div */}
                            <div ref={loadMoreRef} className="py-4 text-center" />
                        </div>
                    ) : (
                        <p>장바구니에 상품이 없습니다.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default CartPage;
