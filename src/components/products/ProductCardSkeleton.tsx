// src/components/products/ProductCardSkeleton.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="border p-4 rounded-md hover:shadow-lg transition-shadow">
            {/* 이미지 자리 표시자: 원래 ProductCard에서 h-48로 지정되어 있으므로 약 192px 정도의 높이 */}
            <Skeleton height={192} width="100%" className="rounded-md mb-2" duration={2.0} />

            {/* 제품 이름 자리 표시자 */}
            <Skeleton height={28} width="80%" className="mb-2" duration={2.0} />

            {/* 가격 자리 표시자 */}
            <Skeleton height={24} width="60%" className="mb-2" duration={2.0} />

            {/* 설명 자리 표시자: 2줄 정도 표시 */}
            <Skeleton height={16} count={2} duration={2.0} />
        </div>
    );
};

export default ProductCardSkeleton;
