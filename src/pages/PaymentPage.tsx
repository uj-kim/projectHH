// src/pages/PaymentPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, updatePaymentStatus } from '@/api/payment';
import { getCartItems } from '@/api/cart';
import ShippingForm from '@/components/payments/ShippingForm';
import OrderSummary from '@/components/payments/OrderSummary';
import PaymentMethod from '@/components/payments/PaymentMethod';
import PaymentForm from '@/components/payments/PaymentForm';
import { useCompletePayment } from '@/hooks/usePaymentComplete';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentStore } from '@/stores/paymentStore';
import { Database } from '@/types/database.types';
import { useUserProfile } from '@/hooks/useUserProfile';

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
    const { data: userProfile } = useUserProfile();
    const queryClient = useQueryClient();
    const { shippingAddress } = usePaymentStore();
    const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
    const [cartData, setCartData] = useState<
        (Database['public']['Tables']['order_products']['Row'] & {
            product: Database['public']['Tables']['products']['Row'];
        })[]
    >([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Cart 데이터 로드 (캐시 또는 API 호출)
    useEffect(() => {
        if (user) {
            const cached = queryClient.getQueryData(['cart', user.id]);
            if (cached && (cached as any).pages) {
                const pages = (cached as any).pages;
                setCartData(pages.flat());
            } else if (cached) {
                setCartData(cached as any);
            } else {
                getCartItems(user.id)
                    .then((data) => setCartData(data))
                    .catch((error) => {
                        toast.error('장바구니 데이터를 불러오지 못했습니다.');
                        console.error(error);
                    });
            }
        }
    }, [user, queryClient]);

    useEffect(() => {
        if (cartData.length > 0) {
            const total = cartData.reduce((sum, item) => sum + item.order_quantity * (item.product?.price || 0), 0);
            setTotalPrice(total);
        }
    }, [cartData]);

    // 주문 생성 mutation
    const createOrderMutation = useMutation<Order, Error, CreateOrderVariables>({
        mutationFn: ({ orderId, orderData }) => createOrder(orderId, orderData),
        onSuccess: (order) => {
            setOrderId(order.order_id);
            toast.info('주문 생성 완료. 결제를 진행합니다.');
        },
        onError: (error) => {
            toast.error('주문 생성에 실패했습니다.');
            console.error(error);
        },
    });

    // 결제 상태 업데이트 mutation (DB 업데이트)
    const updatePaymentStatusMutation = useMutation({
        mutationFn: updatePaymentStatus,
        onSuccess: () => {
            toast.success('결제 성공!');
            navigate('/mypage');
        },
        onError: (error) => {
            toast.error('결제 상태 업데이트에 실패했습니다.');
            console.error(error);
        },
    });

    // completePayment mutation (Edge Function 호출)
    const completePaymentMutation = useCompletePayment();

    // PaymentForm에 전달할 completePaymentAction 함수
    // paymentId만 인자로 받되, 내부에서 주문 정보(orderId, totalPrice)를 함께 전달합니다.
    const handleCompletePayment = async (paymentId: string) => {
        if (!orderId) {
            throw new Error('Order ID is not available');
        }
        const verifyResult = await completePaymentMutation.mutateAsync({
            paymentId,
            order: { id: orderId, amount: totalPrice },
        });
        if (verifyResult.status === 'PAID') {
            // 결제 검증이 성공하면, DB의 결제 상태를 업데이트합니다.
            await updatePaymentStatusMutation.mutateAsync({
                order_id: orderId,
                user_id: user!.id,
                payment_method: paymentMethod,
                payment_status: 'Completed',
            });
        }
        return verifyResult;
    };

    // 주문 생성만 진행하는 함수; 실제 결제 요청은 PaymentForm이 담당합니다.
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
        const orderIdFromCart = cartData[0].order_id;
        await createOrderMutation.mutateAsync({
            orderId: orderIdFromCart,
            orderData: {
                buyer_id: user.id,
                delivery_address: shippingAddress,
                total_price: totalPrice,
                status: 'Pending', // 초기 상태
            },
        });
    };

    if (!user) return <div>로그인이 필요합니다.</div>;
    if (cartData.length === 0) return <div>결제할 상품 로딩 중...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">결제 페이지</h1>
            <ShippingForm />
            <OrderSummary items={cartData} totalPrice={totalPrice} />
            <PaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            <button
                onClick={handlePayment}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={createOrderMutation.isPending}
            >
                {createOrderMutation.isPending ? '주문 생성 중' : '주문 생성 및 결제하기'}
            </button>
            {/* 주문 생성이 완료되면 PaymentForm 렌더링 */}
            {orderId && (
                <PaymentForm
                    item={{
                        id: cartData[0].product.product_id,
                        name: cartData[0].product.product_name,
                        price: cartData[0].product.price,
                        currency: 'CURRENCY_KRW',
                    }} // 실제 DB의 상품 정보를 전달
                    fullName={userProfile?.nickname || ''}
                    email={userProfile?.email || ''}
                    phoneNumber={`010-7610-5403`}
                    storeId={import.meta.env.VITE_PORTONE_STORE_ID!}
                    channelKey={import.meta.env.VITE_PORTONE_CHANNEL_KEY!}
                    completePaymentAction={handleCompletePayment}
                />
            )}
        </div>
    );
};

export default PaymentPage;
