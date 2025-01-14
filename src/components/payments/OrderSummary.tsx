//장바구니 상품 내역과 총 결제 금액 표시
import { Database } from '@/types/database.types';
import { formatCurrency } from '@/utils/formatting';

interface OrderSummaryProps {
    items: (Database['public']['Tables']['order_products']['Row'] & {
        product: Database['public']['Tables']['products']['Row'];
    })[];
    totalPrice: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, totalPrice }) => {
    return (
        <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">주문 내역</h2>
            <ul>
                {items.map((item) => (
                    <li key={item.product_id} className="flex justify-between py-1">
                        <span>{item.product?.product_name}</span>
                        <span>{item.order_quantity}</span>
                        <span>{formatCurrency(item.order_quantity * (item.product?.price || 0))}</span>
                    </li>
                ))}
            </ul>
            <div className="flex justify-between font-bold mt-2">
                <span>총 결제 금액</span>
                <span>{formatCurrency(totalPrice)}</span>
            </div>
        </div>
    );
};

export default OrderSummary;
