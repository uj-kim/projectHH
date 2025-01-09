// src/components/ProductDetail.tsx

import React from 'react';
import { Database } from '@/types/database.types';

interface ProductDetailProps {
    product: Database['public']['Tables']['products']['Row'];
    // favorite: boolean;
    // toggleFavorite: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* 상품 이미지 */}
            <div className="md:w-1/2">
                <img
                    src={product.image_url || '/placeholder-image.png'}
                    alt={product.product_name}
                    className="w-full h-auto object-cover rounded-md shadow-md"
                />
            </div>

            {/* 상품 정보 */}
            <div className="md:w-1/2 flex flex-col gap-4">
                {/* 가격 */}
                <p className="text-2xl font-bold text-green-600">₩{product.price.toLocaleString()}</p>

                {/* 상품 이름 */}
                <h2 className="text-3xl font-semibold">{product.product_name}</h2>

                {/* 장바구니에 추가 버튼 */}
                <button
                    onClick={() => alert('장바구니에 추가되었습니다!')}
                    className="mt-2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    장바구니에 추가
                </button>

                {/* 상품 설명 */}
                <p className="mt-4 text-gray-700">{product.description}</p>

                {/* 추후 리뷰 섹션 추가 예정 */}
                {/* <div className="mt-6">
                    <h3 className="text-xl font-semibold">리뷰</h3>
                    {/* 리뷰 컴포넌트 추가 예정 */}
                {/* </div> */}
            </div>
        </div>
    );
};

export default ProductDetail;
