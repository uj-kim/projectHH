// src/components/PurchaseHistoryTable.tsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCompletedOrders } from "@/api/payment";
import { OrderDetail } from "@/types/OrderDetail";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "@/features/Reviews/ReviewModal";
const PurchaseHistoryTable: React.FC = () => {
  const {
    data: user,
    isLoading: isAuthLoading,
    isError: isAuthError,
    error: authError,
  } = useAuth();

  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useQuery<OrderDetail[], Error>({
    queryKey: ["completedOrders", user?.id],
    queryFn: () => getCompletedOrders(user?.id || ""),
    enabled: !!user?.id,
    // staleTime: 5 * 60 * 1000,
  });

  // 모달 관련 state: 선택된 주문(여기서는 order_id와 product_id를 전달)
  const [selectedOrder, setSelectedOrder] = useState<{
    orderId: string;
    productId: string;
  } | null>(null);

  // 주문 내역을 결제일 기준으로 그룹화
  const groupedOrders = useMemo(() => {
    const groups: { [date: string]: OrderDetail[] } = {};
    orders.forEach((order) => {
      const date = order.payment_created_at
        ? new Date(order.payment_created_at).toLocaleDateString()
        : "Invalid Date";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });
    return groups;
  }, [orders]);

  if (isAuthLoading || isOrdersLoading) return <div>로딩 중...</div>;
  if (isAuthError)
    return <div className="text-red-500">인증 오류: {authError?.message}</div>;
  if (!user) return <div>로그인이 필요합니다.</div>;
  if (isOrdersError)
    return (
      <div className="text-red-500">
        주문 내역 로딩 오류: {ordersError?.message}
      </div>
    );

  const tableHeader = (
    <TableHeader>
      <TableRow>
        <TableHead className="whitespace-nowrap text-center">
          상품 이미지
        </TableHead>
        <TableHead className="whitespace-nowrap text-center">상품명</TableHead>
        <TableHead className="whitespace-nowrap text-center">수량</TableHead>
        <TableHead className="whitespace-nowrap text-center">단가</TableHead>
        <TableHead className="whitespace-nowrap text-center">총 가격</TableHead>
        <TableHead className="whitespace-nowrap text-center">
          리뷰작성
        </TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderEmptyRow = () => (
    <TableRow>
      <TableCell colSpan={6} className="text-center">
        구매한 내역이 없습니다.
      </TableCell>
    </TableRow>
  );

  const renderTable = (bodyContent: React.ReactNode) => (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        {tableHeader}
        <TableBody>{bodyContent}</TableBody>
      </Table>
    </div>
  );

  if (orders.length === 0) return renderTable(renderEmptyRow());

  return (
    <div className="w-full space-y-6">
      {Object.entries(groupedOrders).map(([date, ordersForDate]) => (
        <div key={date}>
          <h3 className="text-lg font-semibold mb-2 pl-2 text-left">{date}</h3>
          {renderTable(
            ordersForDate.map((order) => (
              <TableRow
                key={`${order.order_id}-${order.product_id}`}
                className="hover:bg-gray-100"
              >
                <TableCell className="whitespace-nowrap flex justify-center">
                  <img
                    src={order.image_url ?? "/default-image.png"}
                    alt={order.product_name ?? "상품 이미지"}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap text-center">
                  <Link to={`/product/${order.product_id}`}>
                    {order.product_name}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap text-center">
                  {order.order_quantity}
                </TableCell>
                <TableCell className="whitespace-nowrap text-center">
                  ₩{order.price.toLocaleString()}
                </TableCell>
                <TableCell className="whitespace-nowrap text-center">
                  ₩{order.total_price.toLocaleString()}
                </TableCell>
                <TableCell className="whitespace-nowrap text-center">
                  {order.review_id ? (
                    <Button
                      className="px-2 py-1 bg-gray-300 text-white rounded cursor-default"
                      disabled
                    >
                      작성완료
                    </Button>
                  ) : (
                    <Button
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                      onClick={() =>
                        setSelectedOrder({
                          orderId: order.order_id,
                          productId: order.product_id,
                        })
                      }
                    >
                      리뷰작성
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </div>
      ))}

      {/* 모달: selectedOrder가 설정되면 ReviewModal을 열어 해당 주문 정보를 전달 */}
      {selectedOrder && (
        <ReviewModal
          orderId={selectedOrder.orderId}
          productId={selectedOrder.productId}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default PurchaseHistoryTable;
