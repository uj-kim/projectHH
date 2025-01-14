// src/hooks/useAuth.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

const fetchUser = async (): Promise<User | null> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        throw new Error(error.message);
    }
    return data.user;
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
// 