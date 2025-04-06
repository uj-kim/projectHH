// src/api/reviews.ts
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';

/**
 * 특정 상품의 모든 리뷰를 가져오는 함수
 * @param productId - 상품 ID
 * @returns 리뷰 목록
 */
export const getReviewsByProductId = async (productId: string): Promise<Database['public']['Views']['reviews_with_nickname']['Row'][]> => {
    const { data, error } = await supabase
        .from('reviews_with_nickname')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false }); // 최신 리뷰가 먼저 오도록 정렬

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

/**
 * 새로운 리뷰를 추가하는 함수
 * @param review - 추가할 리뷰 데이터
 * @returns 추가된 리뷰
 */
export const addReview = async (review: Database['public']['Tables']['reviews']['Insert']): Promise<Database['public']['Tables']['reviews']['Row']> => {
    const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .single(); // 단일 레코드 반환

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

    /**
 * 사용자 해당 상품 구매 건수 조회(주문별)
 * @param productId - 상품 ID
 * @param userId - 사용자 ID
 * @returns 구매 건수
 */
export const getPurchasedCount = async (
    productId: string,
    userId: string
    ): Promise<number> => {
    const { count, error } = await supabase
        .from('order_details')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('buyer_id', userId)
        .eq('status', 'Completed');

    if (error) {
        throw new Error(error.message);
    }

    return count || 0;
    };

/**
* 사용자 해당 상품 리뷰 작성 횟수 조회
* @param productId - 상품 ID
* @param userId - 사용자 ID
* @returns 리뷰 작성 건수
*/
export const getReviewCount = async (
    productId: string,
    userId: string
): Promise<number> => {
    const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('user_id', userId);

    if (error) {
        throw new Error(error.message);
    }

    return count || 0;
};

// /***
//  * order_products 테이블의 해당 주문 행에 review_id를 업데이트하는 함수
//  * @param orderId - 주문 ID (order_products)
//  * @param productId - 상품 ID
//  * @param reviewId - 생성된 리뷰 ID
//  */
// export const updateOrderProductsReview = async (
//     orderId: string,
//     productId: string,
//     reviewId: string
// ): Promise<Database['public']['Tables']['order_products']['Row']> => {
//     const { data, error } = await supabase
//         .from('order_products')
//         .update({ review_id: reviewId })
//         .eq('order_id', orderId)
//         .eq('product_id', productId)
//         .single();
//     if (error) {
//         throw new Error(error.message);
//     }
//     return data;
// };