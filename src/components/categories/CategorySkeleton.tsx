// src/components/categories/CategorySkeleton.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CategorySkeleton: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-transparent transition-all duration-300 aspect-[3/4] shadow-none hover:shadow-xl">
            <div className="flex justify-center items-center w-24 h-24 md:w-32 md:h-32 lg:w-32 lg:h-32 mb-4">
                {/* 고정 픽셀 값(예: 96px)을 사용하면 작은 화면에서 올바른 원형 형태를 보여줍니다.
                    md: 이상에서는 128px 등으로 조정하려면 별도의 조건부 렌더링 또는 CSS 미디어쿼리를 활용할 수 있습니다. */}
                <Skeleton
                    circle={true}
                    height={96}
                    width={96}
                    duration={1.2} // 애니메이션 주기를 1.2초로 설정
                    baseColor="#f0f0f0" // 기본 색상
                    highlightColor="#e0e0e0"
                />
            </div>
            <Skeleton width={80} height={20} />
        </div>
    );
};

export default CategorySkeleton;
