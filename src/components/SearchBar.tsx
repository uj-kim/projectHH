// src/components/SearchBar.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input'; // shadcn/ui의 Input 컴포넌트
import { FaSearch } from 'react-icons/fa'; // 검색 아이콘 (선택 사항)
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full">
            {/* 검색 아이콘 (옵션) */}
            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />

            <Input
                type="text"
                placeholder="검색어를 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand transition-colors duration-300 w-full"
            />
        </form>
    );
};

export default SearchBar;
