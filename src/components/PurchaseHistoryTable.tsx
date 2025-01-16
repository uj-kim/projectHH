// src/components/PurchaseHistoryTable.tsx
import { useQuery } from '@tanstack/react-query';
import { getCompletedOrders } from '@/api/payment';
import { OrderDetail } from '@/types/OrderDetail';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
// import OrderDetailModal from './OrderDetailModal';

const PurchaseHistoryTable: React.FC = () => {
    const { data: user, isLoading: isAuthLoading, isError: isAuthError, error: authError } = useAuth();
    // const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

    // React Query를 사용하여 완료된 주문 내역을 가져옵니다.
    const {
        data: orders = [],
        isLoading: isOrdersLoading,
        isError: isOrdersError,
        error: ordersError,
    } = useQuery<OrderDetail[], Error>({
        queryKey: ['completedOrders', user?.id],
        queryFn: () => getCompletedOrders(user?.id || ''),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 30 * 60 * 1000, // 30분
    });

    console.log(orders);
    // 인증 상태 로딩 중
    if (isAuthLoading) {
        return <div>인증 상태를 확인 중입니다...</div>;
    }

    // 인증 오류 발생
    if (isAuthError) {
        return <div className="text-red-500">인증 오류: {authError?.message}</div>;
    }

    // 인증되지 않은 사용자
    if (!user) {
        toast.error('로그인이 필요합니다.');
        return null;
    }

    // 주문이 없는 경우
    if (isOrdersLoading) {
        return <div>주문 내역을 불러오는 중...</div>;
    }

    if (isOrdersError) {
        return <div className="text-red-500">주문 내역을 불러오는 중 오류가 발생했습니다: {ordersError?.message}</div>;
    }

    if (orders.length === 0) {
        return <div>완료된 구매 내역이 없습니다.</div>;
    }

    // 주문별로 그룹화하는 함수
    // const groupOrdersByOrderId = (orders: OrderDetail[]) => {
    //     const groups: { [key: string]: OrderDetail } = {};

    //     orders.forEach((order) => {
    //         if (!groups[order.order_id]) {
    //             groups[order.order_id] = {
    //                 ...order,
    //                 order_products: [],
    //             };
    //         }
    //         groups[order.order_id].order_products.push({
    //             product_id: order.product_id,
    //             order_quantity: order.order_quantity,
    //             product_name: order.product_name,
    //             seller_id: order.seller_id,
    //             price: order.price,
    //             image_url: order.image_url,
    //             nickname: order.nickname,
    //         });
    //     });

    //     return groups;
    // };
    // 날짜별로 주문을 그룹화하는 함수
    const groupOrdersByDate = (orders: OrderDetail[]) => {
        return orders.reduce(
            (groups, order) => {
                const date = new Date(order.created_at ?? '').toLocaleDateString();
                if (!groups[date]) {
                    groups[date] = [];
                }
                groups[date].push(order);
                return groups;
            },
            {} as { [key: string]: OrderDetail[] }
        );
    };

    // const groupedOrders = groupOrdersByOrderId(orders);
    const groupedOrders = groupOrdersByDate(orders);

    // 주문 클릭 시 모달 열기
    // const handleOrderClick = (order: OrderDetail) => {
    //     setSelectedOrder(order);
    // };

    // 모달 닫기
    // const closeModal = () => {
    //     setSelectedOrder(null);
    // };

    return (
        <div className="space-y-6">
            {Object.keys(groupedOrders).map((date) => (
                <div
                    key={date}
                    className="border p-4 rounded cursor-pointer hover:bg-gray-100"
                    // onClick={() => handleOrderClick(order)}
                >
                    <h3 className="text-lg font-semibold mb-2">{date}</h3>
                    {groupedOrders[date].map((order) => (
                        <div key={order.order_id} className="border p-4 rounded cursor-pointer hover:bg-gray-100">
                            <div className="mb-2">
                                <strong>배송지:</strong> {order.delivery_address}
                            </div>
                            <div className="mb-2">
                                <strong>총 금액:</strong> ₩{order.total_price.toLocaleString()}
                            </div>
                            <div className="mb-2">
                                <strong>결제 상태:</strong> {order.payment_status}
                            </div>
                        </div>
                    ))}
                    <div>
                        <strong>구매 상품:</strong>
                        <ul className="list-disc list-inside">
                            {orders
                                .filter((o) => o.order_id)
                                .map((item) => (
                                    <li
                                        key={`${item.order_id}-${item.product_id}`}
                                        className="flex items-center space-x-4"
                                    >
                                        <img
                                            src={item.image_url ?? '/default-image.png'}
                                            alt={item.product_name ?? '상품명 없음'}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <p>{item.product_name}</p>
                                            <p>판매자: {item.nickname}</p>
                                            <p>수량: {item.order_quantity}</p>
                                            <p>가격: ₩{item.price.toLocaleString()}</p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            ))}
            {/* 주문 상세 정보 모달 */}
            {/* <OrderDetailModal isOpen={!!selectedOrder} onRequestClose={closeModal} order={selectedOrder} /> */}
        </div>
    );
};

export default PurchaseHistoryTable;
