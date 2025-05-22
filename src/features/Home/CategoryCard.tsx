// src/components/categories/CategoryCard.tsx
import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const isActive = location.pathname === `/c/${category.category_id}`;

  return (
    <Link
      to={`/c/${category.category_id}`}
      className="group flex flex-col items-center gap-3 py-4 transition-all flex-shrink-0 basis-[12%] max-w-[12%]"
    >
      <div
        className={`w-[80%] aspect-[3/4] bg-gray-100 bg-cover bg-center rounded-xl transition-shadow duration-200 ${
          isActive
            ? "border-2 border-gray-900 shadow-[0px_1px_3px_0px_#0000004d,_0px_4px_8px_3px_#00000026] scale-105"
            : "border-2 border-transparent"
        } group-hover:shadow-[0px_1px_3px_0px_#0000004d,_0px_4px_8px_3px_#00000026] group-hover:scale-[1.03]`}
        style={{
          backgroundImage: `url(${category.category_image_url || "/placeholder.png"})`,
        }}
      />
      <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
        {category.category_name}
      </p>
    </Link>
  );
};

export default CategoryCard;
