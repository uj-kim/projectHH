//결제페이지
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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

    const { shippingAddress } = usePaymentStore();
    const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

    //장바구니 데이터 fetching
    const {
        data: cartData,
        isLoading: isCartLoading,
        isError: isCartError,
        error: cartError,
    } = useQuery({
        queryKey: ['cartItems', user?.id],
        queryFn: () => getCartItems(user?.id || ''),
        enabled: !!user?.id,
    });

    //주문 생성 mutation
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

    //주문내역 및 총 금액 설정
    const [totalPrice, setTotalPrice] = useState<number>(0);

    useEffect(() => {
        if (cartData && Array.isArray(cartData)) {
            //총 결제 금액 계산
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
            //주문 생성
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

    if (isCartLoading) return <div>결제할 상품 로딩 중...</div>;
    if (isCartError) return <div className="text-red-500"> 결제 상품 로딩 오류 : {cartError.message}</div>;
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">결제 페이지</h1>
            <ShippingForm />
            <OrderSummary items={cartData || []} totalPrice={totalPrice} />
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
