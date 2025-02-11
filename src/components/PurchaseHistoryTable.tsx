// src/components/PurchaseHistoryTable.tsx
'use client';

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

    // created_at 날짜 기준으로 주문 데이터를 그룹화 (날짜 문자열로 그룹핑)
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
    if (orders.length === 0) return <div>완료된 구매 내역이 없습니다.</div>;

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
                                {ordersForDate.map((order) => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PurchaseHistoryTable;
