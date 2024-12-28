import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
}));

export default useAuthStore;
