// src/hooks/useSignOut.ts

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

export const useSignOut = () => {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (error) => {
      toast.error(`로그아웃에 실패했습니다: ${error.message}`);
      console.error("Logout error:", error);
    },
  });
};
