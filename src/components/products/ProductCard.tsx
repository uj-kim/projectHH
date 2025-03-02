// src/components/products/ProductCard.tsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist, Product } from '@/stores/wishlistStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { addToCart } from '@/api/cart';

interface ProductCardProps {
    product: Product;
    showCartButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showCartButton = false }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { wishlists, toggleWishlist } = useWishlist();
    const { data: user } = useAuth();

    // 로그인한 경우에만 해당 사용자의 wishlist를 확인
    const isWishlisted = user ? (wishlists[user.id] || []).some((p) => p.product_id === product.product_id) : false;

    const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Link 클릭 시 페이지 이동 방지
        if (!user) {
            toast.info('로그인이 필요합니다.');
            return;
        }
        toggleWishlist(user.id, product);
    };

    // "장바구니에 추가" 버튼 클릭 핸들러
    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!user) {
            toast.info('로그인이 필요합니다.');
            return;
        }
        try {
            // 수량은 1로 설정
            await addToCart(user.id, product.product_id, 1);
            toast.success('장바구니에 추가되었습니다.');
        } catch (error) {
            console.error(error);
            toast.error('장바구니 추가에 실패했습니다.');
        }
    };

    if (!imageLoaded) {
        return (
            <Link
                to={`/product/${product.product_id}`}
                className="border p-4 rounded-md hover:shadow-lg transition-shadow relative"
            >
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

    return (
        <Link
            to={`/product/${product.product_id}`}
            className="border p-4 rounded-md hover:shadow-lg transition-shadow relative group"
        >
            <img
                src={product.image_url || '/placeholder.png'}
                alt={product.product_name}
                className="w-full h-48 object-cover rounded-md mb-2"
            />

            {/* 오른쪽 상단 하트 버튼 */}
            <Button
                variant="ghost"
                onClick={handleToggleWishlist}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md shadow-black-500/20 hover:bg-white hover:border-white hover:shadow-lg hover:shadow-black-500/40 text-xl text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-0 active:outline-none"
            >
                {isWishlisted ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            </Button>

            {/* 위시리스트 페이지에서만 "장바구니에 추가" 버튼 표시 */}
            {showCartButton && (
                <Button
                    variant="default"
                    onClick={handleAddToCart}
                    className="absolute w-full bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 bg-blue-500 text-white rounded-md hover:bg-blue-600 group-hover:opacity-100 transition-opacity"
                >
                    장바구니에 추가
                </Button>
            )}

            <h2 className="text-lg font-semibold">{product.product_name}</h2>
            <p className="text-gray-700">₩{product.price.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">{product.description}</p>
        </Link>
    );
};

export default ProductCard;
