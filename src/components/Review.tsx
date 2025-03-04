// src/components/reviews/ReviewSection.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviewsByProductId, addReview } from '@/api/reviews';
import { Database } from '@/types/database.types';
import { useAuth } from '@/hooks/useAuth'; // 인증 훅
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';

interface ReviewSectionProps {
    productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
    const queryClient = useQueryClient();
    const { data: user, isLoading: isAuthLoading, isError: isAuthError, error: authError } = useAuth();

    // 리뷰 가져오기
    const {
        data: reviews,
        isLoading,
        isError,
        error,
    } = useQuery<Database['public']['Views']['reviews_with_nickname']['Row'][], Error>({
        queryKey: ['reviews', productId],
        queryFn: () => getReviewsByProductId(productId),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // 리뷰 추가 Mutation
    const mutation = useMutation({
        mutationFn: addReview,
        onSuccess: () => {
            toast.success('리뷰가 성공적으로 추가되었습니다!');
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            setNewReview({ rating: 5, comment: '' });
        },
        onError: (error: Error) => {
            toast.error(`리뷰 추가에 실패했습니다: ${error.message}`);
        },
    });

    // 새 리뷰 상태
    const [newReview, setNewReview] = useState<{ rating: number; comment: string }>({
        rating: 5,
        comment: '',
    });

    // 리뷰 제출 핸들러
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('로그인이 필요합니다.');
            return;
        }

        if (newReview.comment.trim() === '') {
            toast.error('리뷰 내용을 입력해주세요.');
            return;
        }

        const reviewData: Database['public']['Tables']['reviews']['Insert'] = {
            product_id: productId,
            user_id: user.id, // 사용자 ID (user 객체의 구조에 따라 조정)
            rating: newReview.rating,
            comment: newReview.comment.trim(),
            created_at: new Date().toISOString(),
        };

        mutation.mutate(reviewData);
    };

    // 별점 선택 핸들러
    const handleRatingChange = (rating: number) => {
        setNewReview((prev) => ({ ...prev, rating }));
    };

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">리뷰 ({reviews?.length || 0})</h3>

            {/* 리뷰 목록 */}
            {isLoading ? (
                <p>리뷰를 로딩 중입니다...</p>
            ) : isError ? (
                <p className="text-red-500">리뷰를 불러오는 중 오류가 발생했습니다: {error.message}</p>
            ) : (
                <div className="space-y-4">
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.review_id} className="border p-4 rounded-md">
                                {/* 상단: 별점 */}
                                <div className="flex">
                                    {[...Array(5)].map((_, index) => (
                                        <FaStar
                                            key={index}
                                            size={18}
                                            className={`${
                                                index < (review.rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                {/* 중간: 리뷰 내용 */}
                                <p className="mt-2 text-left">{review.comment}</p>
                                {/* 하단: 작성자 닉네임과 날짜 */}
                                <div className="mt-2 text-gray-600 text-xs text-left">
                                    <span className="p-1">{review.nickname ? review.nickname : 'Anonymous'}</span>
                                    <span className="p-1">
                                        {new Date(review.created_at || '').toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>아직 작성된 리뷰가 없습니다.</p>
                    )}
                </div>
            )}

            {/* 새 리뷰 작성 폼 */}
            <div className="mt-8">
                <h4 className="text-xl font-semibold mb-2">리뷰 작성</h4>
                {isAuthLoading ? (
                    <p>인증 상태를 확인 중입니다...</p>
                ) : isAuthError ? (
                    <p className="text-red-500">인증 오류: {authError?.message}</p>
                ) : user ? (
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
                                                ratingValue <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'
                                            }`}
                                            onClick={() => handleRatingChange(ratingValue)}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* 리뷰 내용 */}
                        <div>
                            <label htmlFor="comment" className="block text-gray-700 mb-1">
                                리뷰:
                            </label>
                            <textarea
                                id="comment"
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
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
                                mutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {mutation.isPending ? '리뷰 작성 중...' : '리뷰 작성'}
                        </button>
                    </form>
                ) : (
                    <p className="text-red-500">리뷰를 작성하려면 로그인해야 합니다.</p>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
