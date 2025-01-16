// src/App.tsx

import './App.css';
import AppRoutes from '@/routes/AppRoutes';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error: Error) => {
            toast.error(`Something went wrong: ${error.message}`);
            console.log(error);
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                queryClient.invalidateQueries({ queryKey: ['user'] });
            } else if (event === 'SIGNED_OUT') {
                queryClient.setQueryData(['user'], null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-gray-100">
                <AppRoutes />
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </QueryClientProvider>
    );
}

export default App;
