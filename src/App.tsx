import './App.css';
import AppRoutes from '@/routes/AppRoutes';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import useAuthStore from '@/stores/authStore';
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
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-gray-100">
                <AppRoutes />;
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
