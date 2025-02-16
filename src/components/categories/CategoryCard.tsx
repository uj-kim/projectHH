import { Link } from 'react-router-dom';
import { useState } from 'react';
import 'react-loading-skeleton/dist/skeleton.css';
import CategorySkeleton from './CategorySkeleton';

interface CategoryCardProps {
    category: {
        category_id: string;
        category_name: string;
        category_image_url: string | null;
    };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Link
            to={`/c/${category.category_id}`}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-transparent transition-all duration-300 aspect-[3/4] shadow-none hover:shadow-xl"
        >
            <div className="relative flex justify-center items-center w-24 h-24 md:w-32 md:h-32 lg:w-32 lg:h-32 mb-4">
                {/* 이미지가 로드되기 전까지 Skeleton을 보여줍니다. */}
                {!imageLoaded && (
                    <div className="absolute inset-0 flex justify-center items-center">
                        <CategorySkeleton />
                    </div>
                )}
                <img
                    src={category.category_image_url || '/placeholder.png'}
                    alt={category.category_name}
                    loading="eager"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover rounded-full transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            </div>
            <p className="text-sm sm:text-base font-semibold text-center text-gray-800">{category.category_name}</p>
        </Link>
    );
};

export default CategoryCard;
