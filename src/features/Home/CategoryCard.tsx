// src/components/categories/CategoryCard.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
      className="flex flex-col items-center justify-center w-20 sm:w-24 gap-2 py-4 hover:bg-gray-50 rounded-lg transition-all"
    >
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-gray-100 bg-cover bg-center"
        style={{
          backgroundImage: `url(${category.category_image_url || "/placeholder-icon.svg"})`,
        }}
      >
        {/* 배경이므로 img 태그는 제거 */}
      </div>
      <p className="text-xs sm:text-sm text-gray-700 text-center whitespace-nowrap">
        {category.category_name}
      </p>
    </Link>
  );
};

export default CategoryCard;
