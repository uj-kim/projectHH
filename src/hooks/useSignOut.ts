// src/hooks/useSignOut.ts

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export const useSignOut = () => {
    return useMutation<void, Error>({
        onMutate: () => supabase.auth.signOut(),
        onError: (error) => {
            throw new Error(error.message);
        },
    });
};
