// src/components/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa'; // 장바구니 아이콘
import LoginModal from './LoginModal';
import SearchBar from './SearchBar'; // SearchBar 컴포넌트 불러오기
import { useAuth } from '@/hooks/useAuth';
import { useSignOut } from '@/hooks/useSignOut';
import { toast } from 'react-toastify';

const Header: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: user } = useAuth();
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

    // if (isPending) return undefined;

    return (
        <header className="flex items-center justify-between p-6 bg-white shadow-[0_1.5px_0px_0px_rgba(0,0,0,0.2)] h-20 max-w-[1400px] mx-auto">
            {/* 왼쪽: 로고 */}
            <div className="flex items-center">
                <Link to="/">
                    {/* 로고 이미지 사용 시 */}
                    {/* <img src="/path-to-logo.png" alt="Logo" className="h-10" /> */}

                    {/* 텍스트 로고 사용 시 */}
                    <h1 className="text-2xl font-bold text-brand">My App</h1>
                </Link>
            </div>

            {/* 중앙: SearchBar 컴포넌트 */}
            <div className="flex-grow mx-4 flex justify-center px-6">
                <SearchBar />
            </div>

            {/* 오른쪽: 장바구니 아이콘 및 로그인/로그아웃 버튼 */}
            <div className="flex items-center space-x-4">
                {/* 장바구니 아이콘 */}
                <Link to="/cart" className="relative">
                    <FaShoppingCart className="text-2xl text-gray-700 hover:text-gray-900" />
                    {/* 장바구니에 담긴 아이템 수 표시 (옵션) */}
                    {/* <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">3</span> */}
                </Link>

                {/* 로그인/로그아웃 버튼 */}
                {user ? (
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-700">{user.user_metadata.name || user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            로그아웃
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLoginClick}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        구글 로그인
                    </button>
                )}
            </div>

            {/* 로그인 모달 */}
            {isModalOpen && <LoginModal onClose={handleCloseModal} />}
        </header>
    );
};

export default Header;
