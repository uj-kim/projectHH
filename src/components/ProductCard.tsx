import { Link } from 'react-router-dom';

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
    return (
        <Link to={`/product/${product.product_id}`} className="border p-4 rounded-md hover:shadow-lg transition-shadow">
            <img
                src={product.image_url || '/placeholder.png'} // 이미지가 없을 경우 대체 이미지 표시
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
