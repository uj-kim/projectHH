// src/components/products/ProductCard.tsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ProductCardProps {
    product: {
        product_id: string;
        product_name: string;
        price: number;
        description: string;
        image_url: string | null;
    };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    // 이미지 로드가 완료되기 전에는 스켈레톤 UI를 렌더링합니다.
    if (!imageLoaded) {
        return (
            <Link
                to={`/product/${product.product_id}`}
                className="border p-4 rounded-md hover:shadow-lg transition-shadow"
            >
                {/* 실제 이미지는 숨겨서 로딩 이벤트만 발생시킴 */}
                <img
                    src={product.image_url || '/placeholder.png'}
                    alt={product.product_name}
                    className="hidden"
                    onLoad={() => setImageLoaded(true)}
                />
                <div className="w-full h-48 mb-2">
                    <Skeleton height="100%" width="100%" className="rounded-md" />
                </div>
                <div className="space-y-2">
                    <Skeleton height={28} width="80%" />
                    <Skeleton height={24} width="60%" />
                    <Skeleton height={16} count={2} />
                </div>
            </Link>
        );
    }

    // 이미지가 로드되면 실제 카드 콘텐츠를 렌더링합니다.
    return (
        <Link to={`/product/${product.product_id}`} className="border p-4 rounded-md hover:shadow-lg transition-shadow">
            <img
                src={product.image_url || '/placeholder.png'}
                alt={product.product_name}
                className="w-full h-48 object-cover rounded-md mb-2"
            />
            <h2 className="text-lg font-semibold">{product.product_name}</h2>
            <p className="text-gray-700">₩{product.price.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">{product.description}</p>
        </Link>
    );
};

export default ProductCard;
