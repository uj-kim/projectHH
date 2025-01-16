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
            className="block overflow-hidden rounded-lg shadow-lg hover:shadow-xl trnasition-shadow"
        >
            <div className="relative h-48">
                <img
                    src={category.category_image_url || '/placeholder.png'}
                    alt={category.category_name}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">
                    <span className="font-semibold text-lg">{category.category_name}</span>
                </div>
            </div>
        </Link>
    );
};

export default CategoryCard;
