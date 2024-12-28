// // src/pages/Home.tsx
// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { User } from '@supabase/supabase-js';
import useAuthStore from '@/stores/authStore';
const Home = () => {
    // const [user, setUser] = useState<User | null>(null);
    const user = useAuthStore((state) => state.user);
    // const fetchUser = async () => {
    //     const {
    //         data: { user },
    //     } = await supabase.auth.getUser();
    //     setUser(user);
    // };

    // useEffect(() => {
    //     fetchUser();

    //     const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    //         setUser(session?.user || null);
    //     });
    //     return () => {
    //         data.subscription.unsubscribe();
    //     };
    // }, []);
    // const handleGoogleLogin = async () => {
    //     const { error } = await supabase.auth.signInWithOAuth({
    //         provider: 'google',
    //     });
    //     if (error) {
    //         console.error('Google 로그인 실패: ', error.message);
    //     } else {
    //         console.log('Google 로그인 성공!');
    //     }
    // };

    // const handleGoogleLogout = async () => {
    //     const { error } = await supabase.auth.signOut();
    //     if (!error) {
    //         setUser(null);
    //         console.log('로그아웃 성공');
    //     }
    // };
    return (
        <div>
            <h2>홈 페이지</h2>
            {user ? (
                // <div>
                //     <button onClick={handleGoogleLogout} className="logout-btn bg-red-500 text-white px-4 py-2 rounded">
                //         로그아웃
                //     </button>
                // </div>
                <h2 className="text-2xl">환영합니다, {user.user_metadata.name}님!</h2>
            ) : (
                // <button
                //     onClick={handleGoogleLogin}
                //     className="google-login-btn bg-blue-500 text-white px-4 py-2 rounded"
                // >
                //     Google로 로그인
                // </button>
                <h2 className="text-2xl">로그인이 필요합니다.</h2>
            )}
        </div>
    );
};

export default Home;
