// src/hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

const fetchUser = async (): Promise<User | null> => {
    // 먼저 세션 확인
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        throw new Error(sessionError.message);
    }
    if (!sessionData?.session) {
        // 로그인하지 않은 상태이면 null 반환
        return null;
    }
    // 세션이 존재하면 세션에 포함된 사용자 정보를 반환
    return sessionData.session.user;
};

export const useAuth = () => {
    return useQuery<User | null, Error>({
        queryKey: ['user'], 
        queryFn: fetchUser, 
        staleTime: Infinity, 
        gcTime: Infinity, 
        refetchOnWindowFocus: false,
    });
};
