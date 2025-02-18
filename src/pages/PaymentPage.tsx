// src/pages/PaymentPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, updatePaymentStatus } from '@/api/payment';
import { getCartItems } from '@/api/cart';
import ShippingForm from '@/components/payments/ShippingForm';
import OrderSummary from '@/components/payments/OrderSummary';
import PaymentMethod from '@/components/payments/PaymentMethod';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentStore } from '@/stores/paymentStore';
import { Database } from '@/types/database.types';

type Order = Database['public']['Tables']['orders']['Row'];

type CreateOrderVariables = {
    orderId: string;
    orderData: {
        buyer_id: string;
        delivery_address: string;
        total_price: number;
        status: string;
    };
};

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: user } = useAuth();
    const queryClient = useQueryClient();
    const { shippingAddress } = usePaymentStore();
    const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

    // 캐시된 장바구니 데이터를 저장할 상태 (CartPage의 쿼리 키는 ['cart', user.id]임)
    const [cartData, setCartData] = useState<
        (Database['public']['Tables']['order_products']['Row'] & {
            product: Database['public']['Tables']['products']['Row'];
        })[]
    >([]);

    useEffect(() => {
        if (user) {
            // queryClient.getQueryData로 캐시 데이터를 가져옵니다.
            const cachedData = queryClient.getQueryData(['cart', user.id]);
            if (cachedData && (cachedData as any).pages) {
                // CartPage에서 useInfiniteQuery를 사용한 경우 pages 배열 구조일 수 있으므로 평탄화합니다.
                const pages = (cachedData as any).pages;
                setCartData(pages.flat());
            } else if (cachedData) {
                // 일반적인 쿼리라면 바로 사용
                setCartData(cachedData as any);
            } else {
                // 캐시 데이터가 없으면 fallback으로 직접 호출합니다.
                getCartItems(user.id)
                    .then((data) => setCartData(data))
                    .catch((error) => {
                        toast.error('장바구니 데이터를 불러오지 못했습니다.');
                        console.error(error);
                    });
            }
        }
    }, [user, queryClient]);

    // 주문 생성 mutation
    const createOrderMutation = useMutation<Order, Error, CreateOrderVariables>({
        mutationFn: ({ orderId, orderData }) => createOrder(orderId, orderData),
        onSuccess: (order) => {
            updatePaymentStatusMutation.mutate({
                order_id: order.order_id,
                user_id: user!.id,
                payment_method: paymentMethod,
                payment_status: 'Completed',
            });
        },
        onError: (error) => {
            toast.error('주문 생성에 실패했습니다.');
            console.error(error);
        },
    });

    const updatePaymentStatusMutation = useMutation({
        mutationFn: updatePaymentStatus,
        onSuccess: () => {
            toast.success('결제 성공!');
            navigate('/mypage');
        },
        onError: (error) => {
            toast.error('결제에 실패했습니다.');
            console.log(error);
        },
    });

    // 총 결제 금액 계산
    const [totalPrice, setTotalPrice] = useState<number>(0);
    useEffect(() => {
        if (cartData && Array.isArray(cartData)) {
            const total = cartData.reduce((sum, item) => sum + item.order_quantity * (item.product?.price || 0), 0);
            setTotalPrice(total);
        }
    }, [cartData]);

    const handlePayment = async () => {
        if (!user) {
            toast.error('로그인이 필요합니다.');
            return;
        }
        if (!shippingAddress) {
            toast.error('배송지를 입력해주세요.');
            return;
        }
        if (!cartData || cartData.length === 0) {
            toast.error('장바구니에 상품이 없습니다.');
            return;
        }

        try {
            const orderId = cartData[0].order_id;
            // 주문 생성 및 결제 상태 업데이트 실행
            await createOrderMutation.mutateAsync({
                orderId,
                orderData: {
                    buyer_id: user.id,
                    delivery_address: shippingAddress,
                    total_price: totalPrice,
                    status: 'Completed',
                },
            });
        } catch (error) {
            console.log(error);
        }
    };

    if (!cartData.length) return <div>결제할 상품 로딩 중...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">결제 페이지</h1>
            <ShippingForm />
            <OrderSummary items={cartData} totalPrice={totalPrice} />
            <PaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            <button
                onClick={handlePayment}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={createOrderMutation.isPending || updatePaymentStatusMutation.isPending}
            >
                {createOrderMutation.isPending || updatePaymentStatusMutation.isPending ? '결제 처리 중' : '결제하기'}
            </button>
        </div>
    );
};

export default PaymentPage;
