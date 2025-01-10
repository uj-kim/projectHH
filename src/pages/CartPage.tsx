import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCartItems, removeCartItem, updateCartItemQuantity } from '@/api/cart';
import useAuthStore from '@/stores/authStore';
import CartItem from '@/components/CartItem';
import { Database } from '@/types/database.types';
import { toast } from 'react-toastify';

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    const {
        data: cartItems,
        isLoading,
        isError,
        error,
    } = useQuery<
        (Database['public']['Tables']['order_products']['Row'] & {
            product: Database['public']['Tables']['products']['Row'];
        })[],
        Error
    >({
        queryKey: ['cart', user?.id],
        queryFn: () => getCartItems(user!.id),
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

    if (!user) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-semibold">로그인이 필요합니다.</h2>
                <button onClick={() => navigate('/login')} className="mt-4 p-2 bg-blue-500 text-white rounded-md">
                    로그인 페이지로 이동
                </button>
            </div>
        );
    }

    const totalPrice = cartItems?.reduce((total, item) => total + item.product.price * item.order_quantity, 0);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">장바구니</h1>

            {isLoading && <p>로딩 중...</p>}
            {isError && <p className="text-red-500 mb-4">오류 발생: {error.message}</p>}

            {!isLoading && !isError && (
                <>
                    {cartItems && cartItems.length > 0 ? (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <CartItem
                                    key={`${item.order_id}-${item.product_id}`}
                                    item={item}
                                    onRemove={() => handleRemove(item.product_id)}
                                    onQuantityChange={(quantity) => handleQuantityChange(item.product_id, quantity)}
                                />
                            ))}
                            {/* 총 금액 및 결제하기 버튼 */}
                            <div className="mt-6 flex justify-between items-center">
                                <p className="text-xl font-semibold">총 금액: ₩{totalPrice?.toLocaleString()}</p>
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                >
                                    결제하기
                                </button>
                            </div>
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
