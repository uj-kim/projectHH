// src/components/categories/CategoryCard.tsx
import { Link } from 'react-router-dom';

interface CategoryCardProps {
    category: {
        category_id: string;
        category_name: string;
        category_image_url: string | null;
    };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    return (
        <Link
            to={`/category/${category.category_id}`}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-transparent transition-all duration-300 aspect-[3/4] shadow-none hover:shadow-xl"
        >
            <div className="flex justify-center items-center  w-24 h-24 md:w-32 md:h-32 lg:w-32 lg:h-32 mb-4">
                <img
                    src={category.category_image_url || '/placeholder.png'}
                    alt={category.category_name}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                />
            </div>
            <p className="text-sm sm:text-base font-semibold text-center text-gray-800">{category.category_name}</p>
        </Link>
    );
};

export default CategoryCard;
