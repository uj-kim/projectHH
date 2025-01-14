// import { useState } from 'react';
import Modal from 'react-modal';
// import { supabase } from '@/lib/supabaseClient';
import { useSignIn } from '@/hooks/useSignIn';
// import useAuthStore from '@/stores/authStore';

Modal.setAppElement('#root');

interface LoginModalProps {
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    // const setUser = useAuthStore((state) => state.setUser);
    const signInMutation = useSignIn();

    const handleGoogleLogin = async () => {
        // const { error } = await supabase.auth.signInWithOAuth({
        //     provider: 'google',
        // });
        // if (error) {
        //     console.error('Error logging in with Google:', error.message);
        // }
        // onClose();

        await signInMutation.mutateAsync();
        onClose();
    };

    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow-lg"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
            <h2 className="text-2xl mb-4">로그인</h2>
            <button
                onClick={handleGoogleLogin}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                구글계정으로 로그인
            </button>
            <button
                onClick={onClose}
                className="mt-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
                닫기
            </button>
        </Modal>
    );
};

export default LoginModal;
