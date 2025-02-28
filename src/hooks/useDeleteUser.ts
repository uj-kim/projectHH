import { useMutation } from '@tanstack/react-query';
import { deleteUserAccount } from '@/api/profile';

export const useDeleteUser = () => {
  return useMutation<void, Error, string>({
    mutationFn: (userId) => deleteUserAccount(userId),
  });
};