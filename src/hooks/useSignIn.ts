// src/hooks/useSignIn.ts

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useSignIn = () => {
  return useMutation<void, Error>({
    onMutate: () => supabase.auth.signInWithOAuth({ provider: "google" }),
    onError: (error) => {
      throw new Error(error.message);
    },
  });
};
