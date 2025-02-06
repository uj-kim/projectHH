// src/components/ProfileInitializer.tsx
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ProfileInitializer = () => {
    useEffect(() => {
        const initializeProfile = async () => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (user !== null && userError) {
                console.error('사용자 정보를 가져오는 데 실패했습니다:', userError.message);
                return;
            }

            if (user) {
                // 사용자 프로필이 존재하는지 확인
                const { data: userProfile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (profileError) {
                    console.error('프로필 조회 오류:', profileError);
                    return;
                }

                if (!userProfile) {
                    // 데이터가 없을 때
                    // 프로필이 없으면 새로 생성
                    const { error: insertError } = await supabase.from('user_profiles').upsert({
                        user_id: user.id,
                        email: user.email || '',
                        nickname: user.user_metadata?.full_name || '기본 닉네임',
                        is_seller: false,
                        address: '',
                    });

                    if (insertError) {
                        console.error('프로필 생성 오류:', insertError.message);
                    } else {
                        console.log('프로필이 성공적으로 생성되었습니다.');
                    }
                } else if (profileError) {
                    console.error('프로필 조회 오류:', profileError);
                } else {
                    console.log('프로필이 이미 존재합니다.');
                }
            }
        };

        initializeProfile();
    }, []);

    return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
};

export default ProfileInitializer;
