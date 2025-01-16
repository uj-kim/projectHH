import React, { useState } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { useSignOut } from '@/hooks/useSignOut';
import { toast } from 'react-toastify';

const Header: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: user, isPending } = useAuth();
    const signOutMutation = useSignOut();

    const handleLoginClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleLogout = async () => {
        await signOutMutation.mutateAsync();
        toast.success('로그아웃 되었습니다.');
    };

    if (isPending) return null;

    return (
        <header className="flex justify-between items-center p-4 bg-white shadow">
            <h1 className="text-xl font-bold">My App</h1>
            {user ? (
                <div className="flex items-center">
                    <span className="mr-4">{user.user_metadata.name || user.email}</span>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        로그아웃
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleLoginClick}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    구글 로그인
                </button>
            )}
            {isModalOpen && <LoginModal onClose={handleCloseModal} />}
        </header>
    );
};

export default Header;
