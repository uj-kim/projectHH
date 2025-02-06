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

