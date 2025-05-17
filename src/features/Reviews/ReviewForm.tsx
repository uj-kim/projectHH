import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addReview } from "@/api/reviews";
import { Database } from "@/types/database.types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";

interface ReviewFormProps {
  orderId: string;
  productId: string;
  onClose: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  orderId,
  productId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  const [newReview, setNewReview] = useState<{
    rating: number;
    comment: string;
  }>({
    rating: 5,
    comment: "",
  });

  const mutation = useMutation({
    mutationFn: addReview,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      await queryClient.invalidateQueries({
        queryKey: ["completedOrders", user?.id],
      });
      onClose();
      setNewReview({ rating: 5, comment: "" });
    },
    onError: (error: Error) => {
      toast.error(`리뷰 추가에 실패했습니다: ${error.message}`);
    },
  });

  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (newReview.comment.trim() === "") {
      toast.error("리뷰 내용을 입력해주세요.");
      return;
    }

    const reviewData: Database["public"]["Tables"]["reviews"]["Insert"] = {
      order_id: orderId,
      product_id: productId,
      user_id: user.id,
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      created_at: new Date().toISOString(),
    };

    mutation.mutate(reviewData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 별점 선택 */}
      <div>
        <label className="block text-gray-700 mb-1">별점:</label>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <FaStar
                key={index}
                size={24}
                className={`cursor-pointer ${
                  ratingValue <= newReview.rating
                    ? "text-yellow-500"
                    : "text-gray-300"
                }`}
                onClick={() => handleRatingChange(ratingValue)}
              />
            );
          })}
        </div>
      </div>

      {/* 리뷰 내용 입력 */}
      <div>
        <label htmlFor="comment" className="block text-gray-700 mb-1">
          리뷰:
        </label>
        <textarea
          id="comment"
          value={newReview.comment}
          onChange={(e) =>
            setNewReview({ ...newReview, comment: e.target.value })
          }
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="리뷰를 작성하세요..."
          required
        ></textarea>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
          mutation.isPending ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {mutation.isPending ? "리뷰 작성 중..." : "리뷰 작성"}
      </button>
    </form>
  );
};

export default ReviewForm;
