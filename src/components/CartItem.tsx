import { Database } from '@/types/database.types';
import { Link } from 'react-router-dom';

interface CartItemProps {
    item: Database['public']['Tables']['order_products']['Row'] & {
        product: Database['public']['Tables']['products']['Row'];
    };
    onRemove: () => void;
    onQuantityChange: (quantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onQuantityChange }) => {
    const { product, order_quantity } = item;

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 border p-4 rounded-md">
            {/* 상품 이미지 */}
            <div className="w-full md:w-1/3">
                <Link to={`/product/${product.product_id}`}>
                    <img
                        src={product.image_url || '/placeholder-image.png'}
                        alt={product.product_name}
                        className="w-full h-48 object-cover rounded-md shadow-md"
                    />
                </Link>
            </div>

            {/* 상품 정보 */}
            <div className="w-full md:w-2/3 flex flex-col gap-2">
                {/* 상품 이름 */}
                <h2 className="text-xl font-semibold">
                    <Link to={`/product/${product.product_id}`} className="hover:underline">
                        {product.product_name}
                    </Link>
                </h2>

                {/* 가격 */}
                <p className="text-lg font-bold text-green-600">₩{product.price.toLocaleString()}</p>

                {/* 수량 조절 */}
                <div className="flex items-center gap-2">
                    <label htmlFor={`quantity-${product.product_id}`} className="font-medium">
                        수량:
                    </label>
                    <input
                        type="number"
                        id={`quantity-${product.product_id}`}
                        min={1}
                        value={order_quantity}
                        onChange={(e) => onQuantityChange(Number(e.target.value))}
                        className="w-16 p-1 border rounded-md"
                    />
                </div>

                {/* 장바구니에서 제거 버튼 */}
                <button
                    onClick={onRemove}
                    className="mt-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                    장바구니에서 제거
                </button>

                {/* 상품 설명 */}
                <p className="mt-2 text-gray-700">{product.description}</p>
            </div>
        </div>
    );
};

export default CartItem;
