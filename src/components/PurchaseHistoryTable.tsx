// src/components/PurchaseHistoryTable.tsx
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCompletedOrders } from '@/api/payment';
import { OrderDetail } from '@/types/OrderDetail';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PurchaseHistoryTable: React.FC = () => {
    const { data: user, isLoading: isAuthLoading, isError: isAuthError, error: authError } = useAuth();

    const {
        data: orders = [],
        isLoading: isOrdersLoading,
        isError: isOrdersError,
        error: ordersError,
    } = useQuery<OrderDetail[], Error>({
        queryKey: ['completedOrders', user?.id],
        queryFn: () => getCompletedOrders(user?.id || ''),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    // 주문 내역이 있을 경우 날짜별로 그룹화
    const groupedOrders = useMemo(() => {
        const groups: { [date: string]: OrderDetail[] } = {};
        orders.forEach((order) => {
            const date = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Invalid Date';
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(order);
        });
        return groups;
    }, [orders]);

    if (isAuthLoading || isOrdersLoading) return <div>로딩 중...</div>;
    if (isAuthError) return <div className="text-red-500">인증 오류: {authError?.message}</div>;
    if (!user) return <div>로그인이 필요합니다.</div>;
    if (isOrdersError) return <div className="text-red-500">주문 내역 로딩 오류: {ordersError?.message}</div>;

    // 전체 주문이 없는 경우
    if (orders.length === 0) {
        return (
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap text-center">상품 이미지</TableHead>
                            <TableHead className="whitespace-nowrap text-center">상품명</TableHead>
                            <TableHead className="whitespace-nowrap text-center">수량</TableHead>
                            <TableHead className="whitespace-nowrap text-center">가격</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                구매한 내역이 없습니다.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {Object.entries(groupedOrders).map(([date, ordersForDate]) => (
                <div key={date}>
                    <h3 className="text-lg font-semibold mb-2 pl-2 text-left">{date}</h3>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap text-center">상품 이미지</TableHead>
                                    <TableHead className="whitespace-nowrap text-center">상품명</TableHead>
                                    <TableHead className="whitespace-nowrap text-center">수량</TableHead>
                                    <TableHead className="whitespace-nowrap text-center">가격</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ordersForDate.length ? (
                                    ordersForDate.map((order) => (
                                        <TableRow
                                            key={`${order.order_id}-${order.product_id}`}
                                            className="hover:bg-gray-100"
                                        >
                                            <TableCell className="whitespace-nowrap flex justify-center">
                                                <img
                                                    src={order.image_url ?? '/default-image.png'}
                                                    alt={order.product_name ?? '상품 이미지'}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-center">
                                                {order.product_name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-center">
                                                {order.order_quantity}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-center">
                                                ₩{order.price.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            구매한 내역이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PurchaseHistoryTable;
