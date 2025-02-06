// src/hooks/useUserProfile.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export type UserProfile = {
  user_id: string;
  email: string;
  is_seller: boolean;
  nickname: string;
  address: string;
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  // auth에서 현재 로그인한 사용자 정보를 가져옵니다.
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(authError.message);
  }
  if (!authData.user) {
    return null;
  }
  const userId = authData.user.id;
  // user_profiles 테이블에서 해당 사용자의 프로필을 조회합니다.
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useUserProfile = () => {
  return useQuery<UserProfile | null, Error>({
    queryKey: ['userProfile'], 
    queryFn: getUserProfile,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
