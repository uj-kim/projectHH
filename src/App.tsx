import './App.css';
import AppRoutes from '@/routes/AppRoutes';
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import useAuthStore from '@/stores/authStore';

function App() {
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        // const session = supabase.auth.getSession();
        // session.then(({ data: { session } }) => {
        //     setUser(session?.user ?? null);
        // });
        // const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
        //     setUser(session?.user ?? null);
        // });

        // return () => {
        //     subscription?.unsubscribe();
        // };
        const fetchSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.log('Error fetching session:', error.message);
            } else {
                setUser(data.session?.user ?? null);
            }
        };

        fetchSession();

        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            data?.subscription.unsubscribe();
        };
    }, [setUser]);

    return (
        <div className="min-h-screen bg-gray-100">
            <AppRoutes />;
        </div>
    );
}

export default App;
