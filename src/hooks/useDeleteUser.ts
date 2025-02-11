// src/hooks/useDeleteUserProfile.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);
  if (error) {
    throw new Error(error.message);
  }
}

export const useDeleteUser = () => {
  return useMutation<void, Error, string>({
    mutationFn: (userId) => deleteUser(userId),
  });
};
