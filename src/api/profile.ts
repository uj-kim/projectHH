import {supabase} from '@/lib/supabaseClient';

export type UserProfile = {
    user_id: string;
    email: string;
    is_seller: boolean;
    nickname: string;
    address: string;
  };

/**
 * 사용자 프로필 생성
 * @param userId
 * @param email
 * @returns
 */
export const createUserProfile = async(userId: string, email: string): Promise<void> => {
    const nickname = email.split('@')[0];
    const defaultAddress = '';


    const {data, error} = await supabase.from('user_profiles').insert({
        user_id: userId,
        email: email,
        is_seller: true,
        nickname: nickname,
        address: defaultAddress,
    });

    if (error) {
        throw new Error('Error creating user profile: ', error);
    }

    console.log('User profile created:', data);
}




/**
 * 사용자 기본 배송지 정보 가져오기
 * @param userId
 * @returns
 */
export const getDefaultAddress = async(userId: string): Promise<string | null> => {
    const {data, error} = await supabase.from('user_profiles').select('address').eq('user_id', userId).maybeSingle();
    console.log('Feched data:', data)
    if(error){
        throw new Error(error.message)
    }
    return data?.address || null;
}

/**
 * 사용자 기본 배송지 업데이트
 * @param userId
 * @param newAddress
 * @returns
 */
export const updateDefaultAddress = async(userId: string, newAddress: string): Promise<string> => {
    const {data, error} = await supabase.from('user_profiles').update({address: newAddress}).eq('user_id', userId).select('address').single();

    if(error){
        throw new Error(error.message)
    }
    return data.address;
}

/*사용자 판매자 상태 업데이트*/
export const updateUserSellerStatus = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from('user_profiles')
        .update({ is_seller: true })
        .eq('user_id', userId);

    if (error) {
        console.error('판매자 상태 업데이트 오류:', error.message);
        throw new Error(error.message);
    }
};

/*사용자 계정 삭제*/
export const deleteUserAccount = async (userId: string): Promise<void> => {

    // 장바구니 내역 삭제 (테이블 명은 실제 사용하는 명으로 변경)
    let { error } = await supabase
    .from('payments')
    .delete()
    .eq('user_id', userId);
    if (error) {
    throw new Error('장바구니 삭제 오류: ' + error.message);
    }

    // 구매 내역 삭제 (orders 테이블의 buyer_id 기준으로 삭제)
    ({ error } = await supabase
    .from('orders')
    .delete()
    .eq('buyer_id', userId));
    if (error) {
    throw new Error('구매 내역 삭제 오류: ' + error.message);
    }

    // 판매 상품 삭제 (products 테이블의 seller_id 기준으로 삭제)
    ({ error } = await supabase
    .from('products')
    .delete()
    .eq('seller_id', userId));
    if (error) {
    throw new Error('판매 상품 삭제 오류: ' + error.message);
    }

    // 마지막으로 사용자 프로필 삭제
    ({ error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId));
    if (error) {
    throw new Error('사용자 프로필 삭제 오류: ' + error.message);
    }
};