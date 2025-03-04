// src/components/reviews/ReviewSection.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getReviewsByProductId, getPurchasedCount, getReviewCount } from '@/api/reviews';
import { Database } from '@/types/database.types';
import { useAuth } from '@/hooks/useAuth'; // 인증 훅
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import ReviewForm from './reviews/ReviewForm';

interface ReviewSectionProps {
    productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
    const queryClient = useQueryClient();
    const { data: user, isLoading: isAuthLoading, isError: isAuthError } = useAuth();

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

    // // 구매 여부 확인: 구매자에 한해서 리뷰작성 폼 활성화
    // const {
    //     data: hasPurchased,
    //     isLoading: isPurchaseLoading,
    //     isError: isPurchaseError,
    // } = useQuery<boolean, Error>({
    //     queryKey: ['purchase', productId, user?.id],
    //     queryFn: () => checkUserPurchasedProduct(productId, user!.id),
    //     enabled: !!user,
    // });

    // 구매 건수와 리뷰 건수를 가져오기 (user가 있을 때만)
    const {
        data: purchasedCount,
        isLoading: isPurchasedCountLoading,
        isError: isPurchasedCountError,
    } = useQuery<number, Error>({
        queryKey: ['purchasedCount', productId, user?.id],
        queryFn: () => getPurchasedCount(productId, user!.id),
        enabled: !!user,
    });

    const {
        data: reviewCount,
        isLoading: isReviewCountLoading,
        isError: isReviewCountError,
    } = useQuery<number, Error>({
        queryKey: ['reviewCount', productId, user?.id],
        queryFn: () => getReviewCount(productId, user!.id),
        enabled: !!user,
    });

    // 구매 건수 > 리뷰 건수를 비교해서 리뷰 작성 가능 여부 판단
    const canUserReview =
        user && purchasedCount !== undefined && reviewCount !== undefined ? purchasedCount > reviewCount : false;

    // 별점 평균 계산 함수
    const avgRating =
        reviews && reviews.length > 0
            ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
            : 0;
    // 평균 별점 아이콘
    const totalAverageStars = () => {
        if (!reviews || reviews.length === 0) return null;
        return (
            <span className="mr-4 inline-flex items-center">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={32} className={i < avgRating ? 'text-yellow-500' : 'text-gray-300'} />
                ))}
            </span>
        );
    };
    return (
        <div className="mt-8">
            <h3 className="text-2xl text-left font-semibold mb-4">
                {totalAverageStars()}
                리뷰 ({reviews?.length || 0})
            </h3>

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

            {/* 리뷰 작성 영역 - 구매자에 한해서 ReviewForm 렌더링 */}
            <div className="mt-8">
                {isAuthLoading || isPurchasedCountLoading || isReviewCountLoading ? (
                    <p>로딩 중입니다...</p>
                ) : isAuthError || isPurchasedCountError || isReviewCountError ? (
                    <p className="text-red-500">해당 상품 구매 여부를 판단하는 중 오류가 발생했습니다.</p>
                ) : (
                    canUserReview && (
                        <div>
                            <h4 className="text-xl font-semibold mb-2">리뷰 작성</h4>
                            <ReviewForm productId={productId} />
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
